import * as d3 from "d3";
import { Primitive as PrimitiveD3, SimulationNodeDatum, svg } from "d3";
import { useRef } from "react";
import { useD3 } from "../hooks/useD3";
import { VariableContainer } from "../VariableContainer";

interface GraphProps {
  container: VariableContainer
  index: number
}
const Graph = (props:GraphProps) => {
  
  console.log(props)

  const data = {
    nodes: props.container.getSnapshot(props.index).vars,
    links: props.container.getSnapshot(props.index).links.map(link => ({
      source: link.src, 
      target: link.dst
    }))
  }

  const draw = (svg: d3.Selection<any, unknown, null, undefined>) => {

    let test : SimulationNodeDatum;



    // const nodes = data.nodes.map((node) => {return {id: node.id}});
    const nodes = data.nodes.map((node) => {return node});
    const links = data.links

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

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(80))
        // .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

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
    .attr("fill", "none")
    .attr("stroke-width", 5)
  .selectAll("path")
  .data(links)
  .join("path")
    // .attr("stroke", d => color(d.type))
    .attr("stroke", d => 'black')
    // .attr("marker-end", d => `url(${new URL(`#arrow-suit`, location)})`);
    .attr("marker-end", d => `url(${new URL(`#arrow-suit`, location)})`);

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
        .call(drag(simulation));

    node.append("circle")
        .attr("stroke", "yellow")
        .attr("fill", "orange")
        .attr("stroke-width", 5)
        .attr("r", 25);
  
    node.append("text")
        .attr("x", -5)
        .attr("y", "0.31em")
        .text(d => d['value'])
      .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

    const linkArc = (d) => {
      const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
      return `
        M${d.source.x},${d.source.y}
        L${d.target.x},${d.target.y}
      `;
    }
    //A${r},${r} 0 0,1 ${d.target.x},${d.target.y}

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

  }

    const svgRef = useD3(
        draw,
        [data.nodes.length]
    )
    // const divRef = useRef(<div></div>)
    // svgRef.current.innerText = "blah";

    // draw(d3.select(svgRef.current))

    return (
        <div style={{
          // width: "100vw",
          // height: "100vh",
        }}>
            <svg
                ref={svgRef}
                style={{
                    height: "50%",
                    width: "100%",
                    marginRight: "0px",
                    marginLeft: "0px",
                }}
                viewBox="-500, -250, 1000, 500"
                >
                {/* <g className="plot-area" />
                <g className="x-axis" />
                <g className="y-axis" /> */}
            </svg>
        </div>
    )
}

export default Graph