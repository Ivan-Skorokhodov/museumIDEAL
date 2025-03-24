import asyncio
import websockets
import json
import random
import signal


async def send_one_position(websocket, path):
    count = 0
    while True:
        coordinates = {
            "x": count,
            "y": 1,
            "z": count
        }
        count += 2

        await asyncio.sleep(10)

        try:
            print("Sent: ", coordinates)
            await websocket.send(json.dumps(coordinates))

        except websockets.ConnectionClosed:
            print("Client disconnected")


async def main():
    server = await websockets.serve(send_one_position, "localhost", 8000)
    print("WebSocket server started on ws://localhost:8000")

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(
            sig, lambda: asyncio.create_task(shutdown(server)))

    await server.wait_closed()


async def shutdown(server):
    print("Shutting down server...")
    server.close()
    await server.wait_closed()
    print("Server shut down complete.")
    sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
