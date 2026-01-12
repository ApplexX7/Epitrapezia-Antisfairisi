import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from "../modules/playerExist";
import { saveOTP, generateOTP, sendVerificationEmail } from "../modules/generateOtp";
import { db } from "../databases/db";


export function ResendOtp(){
    return async ( req : FastifyRequest<{Body : {email : string}}>,
        reply:FastifyReply,
    ) => {
        try{

            const {email} = req.body;
            const user = await playerExist(email, "");
            if (!user)
                return reply.code(409).send({ message: "invalid email" });
            await new Promise<void>((resolve, reject) => {
                db.run(
                  "DELETE FROM player_otps WHERE id = ?",
                  [user.id],
                  (err) => (err ? reject(err) : resolve())
                );
              });
            const otp = generateOTP();
            await saveOTP(user.id, otp, "email_verification", 30);
            await sendVerificationEmail(email, otp);
            return reply.status(200).send({
                message: "OTP resent successfully",
            })
        } catch (err) {
            console.log(err);
            return reply.status(400).send({ message: "Internal server error" });
        }
    }
}