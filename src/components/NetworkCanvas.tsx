import React, { useState } from "react";
import type { Node } from "../types/types";
import { bfs } from "../utils/bfs";

const NetworkCanvas = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [routerCount, setRouterCount] = useState<number>(1);
  const [packetSourceId, setPacketSourceId] = useState<string | null>(null);
  const [packetTargetId, setPacketTargetId] = useState<string | null>(null);
  const [packetPath, setPacketPath] = useState<string[]>([]);
  const [mode, setMode] = useState<"CONNECT" | "PACKET">("CONNECT");
  const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  const MESSAGES = {
    SOURCE_NODE: "Please select a source node",
    TARGET_NODE: "Please select a target node",
    PACKET: "Packet has been sent successfully",
    NODE_CONNECTED: "Nodes are connected",
    NODE_DISCONNECTED: "Connection between nodes are removed",
    NODE_NOT_CONNECTED: "Nodes are not connected for packets to travel",
    CHANGE_MODE: "Change to connect mode to create nodes and connection",
    SEND_PACKET: "Click send packet",
    NOT_VALID_PATH: "No any valid path between the nodes"
  } as const; //property can't be reassigned after initialization.

  //logic to handle the packet send with bfs traversal
  const handlePacketSend = () => {
    const path = bfs(nodes, packetSourceId!, packetTargetId!)
    if(path){
      setPacketPath(path);
    }else{
      setMessage(MESSAGES.NOT_VALID_PATH);
    }
    const getNodeById = (id:string) => nodes.find(n => n.id === id)!; 
    const packetPositions = packetPath.map(id => {
      const node = getNodeById(id); 
      return {x: node.x, y: node.y}; 
    })

    let index = 0; 
    function animatePacket() {
      if(index >= packetPositions.length -1){
        return; 
      }
      const current = packetPositions[index]
      const next = packetPositions[index +1]

      setPacketPos({x : current.x, y: current.y});
      setTimeout(() => {
        setPacketPos({ x: next.x, y: next.y });
        index++;
        animatePacket();
        console.log(packetPath);
      }, 5000);
    }
    animatePacket();
    setMessage(MESSAGES.PACKET);
  };
  //logic to create a node in the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === "CONNECT") {
      const rect = e.currentTarget.getBoundingClientRect(); //return value is DOMRect object containing entire element including padding and border-width.
      const x = e.clientX - rect.left; //calculating the position of the click inside of the canvas.
      const y = e.clientY - rect.top;
      console.log("Mouse Click: ", x, y);
      const newNode: Node = {
        id: `node-${nodeCount}`,
        label: `router-${routerCount}`,
        x,
        y,
        connection: [],
      };
      setNodes((prev) => {
        const updated = [...prev, newNode];
        console.log("New nodes array:", nodes);
        return updated;
      });
      setNodeCount((prev) => prev + 1);
      setRouterCount((prev) => prev + 1);
    } else {
      setMessage(MESSAGES.CHANGE_MODE);
    }
  };

  //if the mode is Connect it will connect two distinct nodes else selecting nodes for packet
  const handleNodeClick = (clickedId: string) => {
    if (mode === "CONNECT") {
      if (!selectedNodeId) {
        setSelectedNodeId(clickedId); //selecting the node if not selected
      } else if (selectedNodeId === clickedId) {
        setSelectedNodeId(null); //deselecting if it is same node
      } else {
        //connecting two distinct nodes this is the logic for the two way connection
        setNodes((prev) =>
          prev.map((node) => {
            if (
              node.id === selectedNodeId &&
              !node.connection.includes(clickedId) //if there is no connection between the two nodes
            ) {
              return { ...node, connection: [...node.connection, clickedId] }; //returning a new array with the id of the node which marks the connection between two nodes
            } else if (
              //similarly for the another node
              node.id === clickedId &&
              !node.connection.includes(selectedNodeId)
            ) {
              return {
                ...node,
                connection: [...node.connection, selectedNodeId],
              };
            }
            return node;
          })
        );
        setSelectedNodeId(null);
        setMessage(MESSAGES.NODE_CONNECTED);
      }
    } else if (mode === "PACKET") {
      handlePacketClick(clickedId);
    }
  };
  //logic to remove the connection on clicking on the connection line
  const handleLineClick = (fromId: string, toId: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === fromId || node.id === toId) {
          return {
            ...node,
            connection: node.connection.filter(
              (id) => id !== (node.id === fromId ? toId : fromId)
            ),
          }; //filtering the connection array to remove the match of the node id in each node.
        }
        return node;
      })
    );
  };
  //for selecting the packet that travels through the connection
  const handlePacketClick = (id: string) => {
    setMessage(MESSAGES.SOURCE_NODE);
    if (!packetSourceId) {
      setMessage(MESSAGES.TARGET_NODE);
      setPacketSourceId(id);
    } else if (!packetTargetId) {
      setMessage(MESSAGES.SEND_PACKET);
      setPacketTargetId(id);
    } else {
      setMessage(null);
      setPacketSourceId(null);
      setPacketTargetId(null);
      setPacketPath([]);
    }
  };

  return (
    <>
      <div
        className="w-[100%] h-[80vh] border-2 border-dashed border-gray-300 relative"
        onClick={handleCanvasClick}
        role="button" //treating the div as a button
        tabIndex={0}
        onKeyDown={(e) => {
          //non-interactive element with click event must have a listner
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
          }
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNodeClick(node.id);
              }
            }}
            onClick={(e) => {
              e.stopPropagation(); //just taking the click on div and preventing regestring click from the outer div.
              handleNodeClick(node.id);
            }}
            style={{
              left: node.x,
              top: node.y,
              backgroundColor: selectedNodeId === node.id ? "red" : "blue",
            }}
            className="absolute w-[70px] h-[70px] text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {node.label}
          </div>
        ))}
        <svg className="absolute w-full h-full inset-0 pointer-events-none">
          <defs>
            <marker
              id="arrow"
              markerWidth={5}
              markerHeight={5}
              refX={6}
              refY={3}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0, 0 L0, 6 L9, 3 z" />
            </marker>
          </defs>
          {nodes.map((node) =>
            node.connection.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;
              //calculating the center position form the node (node is of 70px)
              const radius = 35;
              const x1 = node.x + radius;
              const y1 = node.y + radius;
              const x2 = target.x + radius;
              const y2 = target.y + radius;
              //calculating the vector distance between two nodes
              const dx = x2 - x1;
              const dy = y2 - y1;
              //calculating the angle made by the line with the Y-axis for angle of direction
              const angle = Math.atan2(dy, dx);
              //line starts from the edge of the each node
              //starting node
              const startX = x1 + radius * Math.cos(angle);
              const startY = y1 + radius * Math.sin(angle);
              //ending node
              const endX = x2 - radius * Math.cos(angle);
              const endY = y2 - radius * Math.sin(angle);
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="black"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                  onClick={(e) => {
                    e.stopPropagation(); //stops the event to bubble up to canvas onClick and fire up new node
                    if (
                      confirm(
                        "Do you want to delete the connection between nodes?"
                      )
                    ) {
                      handleLineClick(node.id, targetId);
                    }
                  }}
                  style={{ cursor: "pointer", pointerEvents: "all" }}
                />
              );
            })
          )}
          return(
          {packetPos && (
            <circle
              cx={packetPos.x + 35}
              cy={packetPos.y + 35}
              r={40}
              stroke="red"
              strokeWidth={3}
              fill="none"
            />
          )}
          ) ()
        </svg>
      </div>
      <div className="flex justify-center items-center w-full gap-3 mt-4">
        <button
          onClick={() => setMode("CONNECT")}
          className={`w-[1/4] px-6 py-6 text-2xl rounded-lg border-2 ${
            mode === "CONNECT" ? "bg-blue-300" : "bg-white"
          } cursor-pointer`}
        >
          Connect Mode
        </button>
        <button
          onClick={() => {
            setMode("PACKET");
            setMessage(MESSAGES.SOURCE_NODE);
          }}
          className={`w-[1/4] px-6 py-6 text-2xl rounded-lg border-2 ${
            mode === "PACKET" ? "bg-blue-300" : "bg-white"
          } cursor-pointer`}
        >
          Packet Mode
        </button>
        {mode === "PACKET" && (
          <button
            onClick={() => handlePacketSend()}
            className={`w-[1/4] px-6 py-6 text-2xl rounded-lg border-2 cursor-pointer focus:bg-green-300`}
          >
            Send Packet
          </button>
        )}
      </div>
      {message && (
        <div className="text-3xl font-semibold text-center text-red-500">
          {message}
        </div>
      )}
    </>
  );
};

export default NetworkCanvas;
