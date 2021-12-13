import * as d3 from "d3";
import { Primitive as PrimitiveD3, SimulationNodeDatum, svg, Simulation } from "d3";
import { useEffect, useRef, useState } from "react";
import { VariableContainer } from "../VariableContainer";

interface GraphProps {
  container: VariableContainer
  index: number
}
const Graph = (props:GraphProps) => {
  
  const data = {
    nodes: props.container.getSnapshot(props.index).vars.map(a => Object.assign({}, a)),
    links: props.container.getSnapshot(props.index).links.map(link => ({
      source: link.src, 
      target: link.dst
    }))
  }

  const nodes = data.nodes.map((node) => {return node});
  const links = data.links

  const simulation = d3.forceSimulation(nodes as any) // TODO: more strict typing
  .force("link", d3.forceLink(links).id(d => (d as any)['id']).distance(80)) // TODO: more strict typing
  .force("charge", d3.forceManyBody().strength(-800))
  .force("x", d3.forceX())
  .force("y", d3.forceY())

  const svgRef = useRef<SVGElement>()

  useEffect(() => {
    initialDraw(d3.select(svgRef.current as any))
  }, []);

  useEffect(() => {
    reDraw(d3.select(svgRef.current as any))
  }, [props.index])

  const reDraw = (svg: d3.Selection<any, unknown, null, undefined>) => {
    console.log("Re-drawing")
    // inspiration for graph -> https://observablehq.com/@d3/mobile-patent-suits?collection=@d3/d3-force

    const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {

      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }

    const t = svg.transition()
      .duration(750);

    const update_nodes = svg.select(".node").selectAll("g")
      .data(nodes, (node) => { return (node as any)['id'] } ) // , (node) => { return node as any } 
    

    const joined_nodes = update_nodes
    .join(
      enter => {
        const node = enter.append("g");
        node
        .append("circle")
        .attr("stroke", "yellow")
        .attr("fill", (d) => d.isValid ? '#51ff00' : '#ff66cd')
        .attr("stroke-width", 5)
        .attr("r", 25)
        node
        .append("text")
        .attr("x", -5)
        .attr("y", "0.31em")
        .text(d => JSON.stringify(d['value']))
        return node
      },
      update => {
        update.select('text').text((d) => JSON.stringify(d['value']))
        update.select('circle')
          .attr("fill", (d) => d.isValid ? '#51ff00' : '#ff66cd')
        return update
      },
      exit => exit
        .call(exit => exit.transition(t).remove())
        .remove()
    )

    const link = svg.select(".links").selectAll("path")
      .data(links)
      .join(
        enter => {
          const link = enter.append("path")
          link
          .attr("stroke", d => 'black')
          .attr("marker-end", d => `url(${new URL(`#arrow-suit`, location as any)})`); // TODO: make location more strict

          return link
        },    
        update => update,
        exit => exit
          .call(exit => exit.transition(t).remove())
          .remove()
    )

    joined_nodes
      .call(drag(simulation) as any);

    // TODO: make typing more strict
    const linkArc = (d: {source: any, target: any}) => {      
      return `
        M${d.source.x},${d.source.y}
        L${d.target.x},${d.target.y}
      `;
    }
  
    simulation.on("tick", () => {
      link.attr("d", linkArc);
      joined_nodes.attr("transform", d => `translate(${(d as any)['x']},${(d as any)['y']})`); // TODO: make d more strict - should be SimpleVar with x any y
    });
  }

  const initialDraw = (svg: d3.Selection<any, unknown, null, undefined>) => {

    console.log("Initial draw")

    let test : SimulationNodeDatum;

    const nodes = data.nodes.map((node) => {return node});
    const links = data.links

    const types =  [
      "licensing",
      "suit",
      "resolved"
    ]

    const color = d3.scaleOrdinal(types, d3.schemeCategory10)

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(types)
        .join("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
        .append("path")
            .attr("fill", color)
            .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke-width", 5)
    .selectAll("path")
    .data(links)
    .join("path")
    // .attr("stroke", d => color(d.type))
    .attr("stroke", d => 'black')
    // .attr("marker-end", d => `url(${new URL(`#arrow-suit`, location)})`);
    .attr("marker-end", d => `url(${new URL(`#arrow-suit`, location as any)})`); // TODO: make location more strict

    const node = svg.append("g")
        .attr("class", "node")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")

          // TODO: make typing more strict
    const linkArc = (d: {source: any, target: any}) => {
      const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
      return `
        M${d.source.x},${d.source.y}
        L${d.target.x},${d.target.y}
      `;
    }

  }

    return (
            <svg
                ref={svgRef as any} // TODO: more strict typing
                style={{
                    height: "50%",
                    width: "100%",
                    marginRight: "0px",
                    marginLeft: "0px",
                }}
                viewBox="-500, -250, 1000, 500"
                >
            </svg>
    )
}

export default Graph