export interface Node{
    id: string; 
    label: string;
    x: number; 
    y: number; 
    connection: string[]; 
}

export interface Connection{
    from: string;
    to: string;
    latency?: number; 
}

export interface Packet{
    id:string;
    data: string;
    currentNode: string;
    targetNode: string; 
    path: string[]; 
}