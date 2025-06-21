import type { Node } from "../types/types";

export function bfs(nodes: Node[], startId : string, endId : string): string[] | null{
    const queue: string[][] = [[startId]]; 
    const visited = new Set<string>(); 

    while (queue.length > 0){
        const path = queue.shift()!;
        const current = path[path.length -1]; 

        if(current === endId){
            return path;
        }
        if(!visited.has(current)){
            visited.add(current);
            const currentNode = nodes.find(n => n.id === current);
            if(!currentNode) continue; 

            currentNode.connection.forEach(neighbourId => {
                if(!visited.has(neighbourId)){
                    queue.push([...path, neighbourId])
                }
            })
        }
    }
    return null;
}