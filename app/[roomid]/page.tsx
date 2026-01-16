import Canvas from "@/components/Canvas";

export default function RoomPage({
  params,
}: {
  params: { roomid: string };
}) {
  return <Canvas roomId={params.roomid} />;
}
