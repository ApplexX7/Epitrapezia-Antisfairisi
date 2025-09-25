export default function Board() {
  return (
    <div
      className="relative m-auto w-[80vw] h-[75vh]"
      style={{ backgroundColor: "#0A0F2A" }}
    >
      <div
        className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm -translate-y-1/2"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      <div className="absolute left-1/2 top-0 h-full w-[1%] -translate-x-1/2 bg-white-smoke" >
      </div>
      <div className="absolute left-1/2 top-1/2 w-[24px] h-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{backgroundColor : "#FF007F"}}>

      </div>
      <div
        className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm -translate-y-1/2"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
    </div>
  );
}
