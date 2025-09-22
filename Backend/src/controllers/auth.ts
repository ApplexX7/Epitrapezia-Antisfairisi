import { FastifyRequest, FastifyReply } from "fastify";

export async function SignUp(
  req: FastifyRequest<{ Body: { username: string; firstName: string; lastName: string; email: string; password: string } }>,
  reply: FastifyReply
) {
  const { username, firstName, lastName, email, password } = req.body;

  console.log(username, firstName, lastName, email, password);

  return { message: "User signed up!", username, email };
}