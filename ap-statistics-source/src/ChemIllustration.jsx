import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ink = "#514d43";
const quiet = "#9a9487";
const green = "#587565";
const blue = "#69b9e8";
const pink = "#f28aaa";
const gold = "#eab24d";

function Atom({ x, protons = 1, neutrons = 0, label = "" }) {
  const particles = [
    ...Array.from({ length: protons }, (_, i) => ({ kind: "proton", i })),
    ...Array.from({ length: neutrons }, (_, i) => ({ kind: "neutron", i })),
  ];
  return (
    <g>
      <circle cx={x} cy="59" r="26" fill="none" stroke={quiet} strokeWidth="1.5" />
      <circle cx={x} cy="33" r="4" fill={blue} />
      {particles.map((particle, i) => {
        const angle = (Math.PI * 2 * i) / Math.max(particles.length, 2) - Math.PI / 2;
        const cx = x + Math.cos(angle) * 5;
        const cy = 59 + Math.sin(angle) * 5;
        return <circle key={particle.kind + i} cx={cx} cy={cy} r="4.3" fill={particle.kind === "proton" ? pink : gold} />;
      })}
      {label ? <text x={x} y="105" textAnchor="middle" className="chem-svg__label">{label}</text> : null}
    </g>
  );
}

const moleculeModels = {
  methane: {
    formula: "CH₄",
    name: "Methane · tetrahedral · 109.5°",
    center: "Carbon",
    outer: "Hydrogen",
    centerColor: "#514d43",
    outerColor: "#69b9e8",
    points: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
  },
  ammonia: {
    formula: "NH₃",
    name: "Ammonia · trigonal pyramidal · about 107°",
    center: "Nitrogen",
    outer: "Hydrogen",
    centerColor: "#4e718d",
    outerColor: "#69b9e8",
    points: [[1.15, -0.6, 0], [-0.58, -0.6, 1], [-0.58, -0.6, -1]],
  },
  water: {
    formula: "H₂O",
    name: "Water · bent · about 104.5°",
    center: "Oxygen",
    outer: "Hydrogen",
    centerColor: "#cf6681",
    outerColor: "#69b9e8",
    points: [[Math.sin(52 * Math.PI / 180), Math.cos(52 * Math.PI / 180), 0], [-Math.sin(52 * Math.PI / 180), Math.cos(52 * Math.PI / 180), 0]],
  },
  boron: {
    formula: "BF₃",
    name: "Boron trifluoride · trigonal planar · 120°",
    center: "Boron",
    outer: "Fluorine",
    centerColor: "#eab24d",
    outerColor: "#69b9e8",
    points: [[1.2, 0, 0], [-0.6, 0, 1.04], [-0.6, 0, -1.04]],
  },
};

function Molecule3D() {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [model, setModel] = useState("methane");
  const data = moleculeModels[model];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(3.9, 3.1, 6.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.replaceChildren(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", `${data.formula}, ${data.name}. Drag to rotate the three-dimensional model.`);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x847967, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const center = new THREE.Vector3(0, 0, 0);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: data.centerColor, roughness: 0.34 });
    const outerMaterial = new THREE.MeshStandardMaterial({ color: data.outerColor, roughness: 0.34 });
    const bondMaterial = new THREE.MeshStandardMaterial({ color: "#b4aa98", roughness: 0.55 });
    const centerAtom = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 24), centerMaterial);
    scene.add(centerAtom);

    for (const rawPoint of data.points) {
      const direction = new THREE.Vector3(...rawPoint).normalize();
      const point = direction.clone().multiplyScalar(1.48);
      const bondVector = point.clone().sub(center);
      const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, bondVector.length(), 14), bondMaterial);
      bond.position.copy(center).add(point).multiplyScalar(0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bondVector.clone().normalize());
      scene.add(bond);
      const outerAtom = new THREE.Mesh(new THREE.SphereGeometry(0.245, 28, 20), outerMaterial);
      outerAtom.position.copy(point);
      scene.add(outerAtom);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4.2;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    const resize = () => {
      const width = Math.max(180, mount.clientWidth);
      const height = Math.max(180, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const draw = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      controlsRef.current = null;
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
        }
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, [data]);

  return (
    <figure className="chem-figure chem-figure--interactive">
      <div className="chem-3d-canvas" ref={mountRef} />
      <figcaption className="chem-3d-caption">
        <span><strong>{data.formula}</strong> · {data.name}</span>
        <span className="chem-3d-legend">Center: {data.center} · Outside: {data.outer} · Drag to rotate</span>
        <label className="chem-model-select">Model
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            {Object.entries(moleculeModels).map(([key, value]) => <option key={key} value={key}>{value.formula} · {value.name.split(" · ")[1]}</option>)}
          </select>
        </label>
        <button className="chem-reset-view" type="button" onClick={() => controlsRef.current?.reset()}>Reset view</button>
      </figcaption>
    </figure>
  );
}

function OrbitalBoxes({ x, y, count = 1, paired = false }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <rect x={x + i * 38} y={y} width="30" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" />
          {paired ? (
            <text x={x + i * 38 + 15} y={y + 18} textAnchor="middle" className="chem-svg__electron">↑↓</text>
          ) : i === 0 ? (
            <text x={x + 15} y={y + 18} textAnchor="middle" className="chem-svg__electron">↑</text>
          ) : null}
        </g>
      ))}
    </g>
  );
}

function AufbauDiagram({ animated }) {
  return (
    <svg className={"chem-svg" + (animated ? " chem-svg--aufbau" : "")} viewBox="0 0 220 132" role="img" aria-label="Orbitals fill in increasing energy order">
      <path d="M18 113V22m0-1-4 8m4-8 4 8" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      <text x="8" y="70" transform="rotate(-90 8 70)" textAnchor="middle" className="chem-svg__label">Energy</text>
      <g className="chem-svg__level">
        <text x="36" y="125" className="chem-svg__label">1s</text>
        <rect x="59" y="104" width="35" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" />
        <g className="orbital-electron orbital-electron--1" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M70 122V109m-4 5 4-5 4 5" /></g>
        <g className="orbital-electron orbital-electron--2" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M83 109v13m-4-4 4 4 4-4" /></g>
      </g>
      <g className="chem-svg__level">
        <text x="36" y="92" className="chem-svg__label">2s</text>
        <rect x="59" y="71" width="35" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" />
        <g className="orbital-electron orbital-electron--3" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M70 89V76m-4 5 4-5 4 5" /></g>
        <g className="orbital-electron orbital-electron--4" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M83 76v13m-4-4 4 4 4-4" /></g>
      </g>
      <g className="chem-svg__level">
        <text x="36" y="59" className="chem-svg__label">2p</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={59 + i * 39} y="38" width="31" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" />
        ))}
        <g className="orbital-electron orbital-electron--5" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M70 56V43m-4 5 4-5 4 5" /></g>
        <g className="orbital-electron orbital-electron--6" fill="none" stroke="#2d7198" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M109 56V43m-4 5 4-5 4 5" /></g>
      </g>
      <g className="chem-svg__level">
        <text x="36" y="26" className="chem-svg__label">3s</text>
        <rect x="59" y="5" width="35" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function VisualBody({ type, annotations = [] }) {
  if (type === "atom" && annotations.length) return <>
    <Atom x={70} label="" />
    <text x="70" y="103" textAnchor="middle" className="chem-svg__label">H-1</text>
    <circle cx="47" cy="125" r="3" fill={pink} /><text x="54" y="128" className="chem-svg__label">proton</text>
    <circle cx="101" cy="125" r="3" fill={blue} /><text x="108" y="128" className="chem-svg__label">e−</text>
    {annotations.map((line, index) => <text key={index} x="154" y={61 + index * 30} className="chem-svg__diagram-note">{line}</text>)}
  </>;
  if (type === "atom") return <><Atom x={110} label="H-1" /><text x="110" y="124" textAnchor="middle" className="chem-svg__label">1 proton · 0 neutrons · 1 electron</text></>;
  if (type === "mass-number") return <><Atom x={110} neutrons={2} label="H-3" /><text x="110" y="124" textAnchor="middle" className="chem-svg__label">#protons + #neutrons</text></>;
  if (type === "isotopes") return <>
    {[0, 1, 2].map((n) => <Atom key={n} x={43 + n * 67} neutrons={n} label={"H-" + (n + 1)} />)}
    <circle cx="56" cy="12" r="3" fill={pink} /><text x="62" y="15" className="chem-svg__label">proton</text>
    <circle cx="111" cy="12" r="3" fill={gold} /><text x="117" y="15" className="chem-svg__label">neutron</text>
    <circle cx="169" cy="12" r="3" fill={blue} /><text x="175" y="15" className="chem-svg__label">e−</text>
    <text x="110" y="124" textAnchor="middle" className="chem-svg__label">same #protons · different #neutrons</text>
  </>;
  if (type === "weighted-mass") return <><path d="M32 92H188M44 92V38M93 92V57M142 92V27" stroke={quiet} strokeWidth="2" /><circle cx="44" cy="38" r="5" fill={blue} /><circle cx="93" cy="57" r="5" fill={pink} /><circle cx="142" cy="27" r="5" fill={gold} /><path d="M58 106H167m-1-4 5 4-5 4" stroke={green} strokeWidth="2" fill="none" /><text x="109" y="125" textAnchor="middle" className="chem-svg__label">isotope masses × fractions → mean</text></>;
  if (type === "mass-spectrum") return <><path d="M34 101V27M34 101H193" stroke={ink} strokeWidth="1.5" /><path d="M70 100V74M111 100V39M158 100V58" stroke={blue} strokeWidth="9" strokeLinecap="round" /><text x="18" y="58" transform="rotate(-90 18 58)" className="chem-svg__label">relative abundance</text><text x="110" y="117" textAnchor="middle" className="chem-svg__label">mass-to-charge ratio · isotope peaks</text></>;
  if (type === "photoelectron-spectrum") return <><path d="M34 101V27M34 101H193m-6-4 6 4-6 4" stroke={ink} strokeWidth="1.5" fill="none" /><path d="M61 100V82M91 100V65M126 100V43M166 100V29" stroke={blue} strokeWidth="12" strokeLinecap="round" /><text x="18" y="58" transform="rotate(-90 18 58)" className="chem-svg__label">electron count</text><text x="110" y="117" textAnchor="middle" className="chem-svg__label">increasing binding energy →</text></>;
  if (type === "particles") return <><g fill={[blue, pink, gold, green, blue, pink]}>{[[70,45],[103,42],[136,48],[84,78],[119,82],[151,76]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="9" />)}</g><text x="110" y="116" textAnchor="middle" className="chem-svg__label">1 mole = 6.022 × 10²³ particles</text></>;
  if (type === "composition") return <><circle cx="110" cy="63" r="34" fill="none" stroke={blue} strokeWidth="16" strokeDasharray="72 142" transform="rotate(-90 110 63)" /><circle cx="110" cy="63" r="34" fill="none" stroke={gold} strokeWidth="16" strokeDasharray="42 172" strokeDashoffset="-72" transform="rotate(-90 110 63)" /><circle cx="110" cy="63" r="34" fill="none" stroke={pink} strokeWidth="16" strokeDasharray="28 186" strokeDashoffset="-114" transform="rotate(-90 110 63)" /><text x="110" y="116" textAnchor="middle" className="chem-svg__label">part ÷ whole × 100%</text></>;
  if (type === "ratio") return <><g fill={blue}>{[0,1,2].map((i)=><circle key={"a"+i} cx={55+i*25} cy="55" r="8" />)}</g><g fill={gold}>{[0,1].map((i)=><circle key={"b"+i} cx={135+i*25} cy="55" r="8" />)}</g><path d="M48 84H172" stroke={quiet} strokeWidth="1.5" /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">reduce to lowest whole numbers</text></>;
  if (type === "orbitals") return <AufbauDiagram animated={false} />;
  if (type === "oxygen-orbital") return <>
    <text x="34" y="34" className="chem-svg__label">Oxygen · 8 electrons</text>
    <text x="30" y="61" className="chem-svg__label">1s</text><rect x="53" y="43" width="36" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" /><text x="71" y="60" textAnchor="middle" className="chem-svg__electron">↑↓</text>
    <text x="30" y="88" className="chem-svg__label">2s</text><rect x="53" y="70" width="36" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" /><text x="71" y="87" textAnchor="middle" className="chem-svg__electron">↑↓</text>
    <text x="30" y="116" className="chem-svg__label">2p</text>{[0,1,2].map((i)=><g key={i}><rect x={53+i*43} y="99" width="36" height="24" rx="2" fill="none" stroke={quiet} strokeWidth="1.5" /><text x={71+i*43} y="116" textAnchor="middle" className="chem-svg__electron">{i===0?"↑↓":"↑"}</text></g>)}
    <text x="110" y="144" textAnchor="middle" className="chem-svg__label">one electron enters each 2p orbital before pairing</text>
  </>;
  if (type === "paired-orbital" || type === "hund-orbitals") {
    const paired = type === "paired-orbital";
    return <><text x="110" y="28" textAnchor="middle" className="chem-svg__label">{paired ? "one orbital" : "equal-energy orbitals"}</text><OrbitalBoxes x={paired ? 92 : 38} y={58} count={paired ? 1 : 3} paired={paired} /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{paired ? "maximum of 2 · opposite spins" : "occupy singly before pairing"}</text></>;
  }
  if (type === "energy-levels") return <><path d="M47 101V31m-4 6 4-6 4 6" fill="none" stroke={ink} strokeWidth="1.7" /><path d="M73 91H171M73 61H171M73 34H171" stroke={quiet} strokeWidth="2" /><text x="60" y="95" textAnchor="end" className="chem-svg__label">E₁</text><text x="60" y="65" textAnchor="end" className="chem-svg__label">E₂</text><path d="M120 84V66m-4 5 4-5 4 5" fill="none" stroke={blue} strokeWidth="2.5" /><text x="110" y="120" textAnchor="middle" className="chem-svg__label">same #e− · higher energy</text></>;
  if (type === "coulomb") return <><circle cx="58" cy="65" r="19" fill={pink} /><text x="58" y="69" textAnchor="middle" className="chem-svg__label">+</text><circle cx="164" cy="65" r="11" fill={blue} /><text x="164" y="69" textAnchor="middle" className="chem-svg__label">−</text><path d="M88 59H135m-6-5 6 5-6 5M135 72H88m6-5-6 5 6 5" fill="none" stroke={green} strokeWidth="2" /><text x="110" y="112" textAnchor="middle" className="chem-svg__label">more charge · less distance → stronger</text></>;
  if (type === "periodic-trend") return <>
    <defs>
      <marker id="trend-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7Z" fill={green} /></marker>
      <marker id="radius-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7Z" fill={gold} /></marker>
    </defs>
    <text x="110" y="15" textAnchor="middle" className="chem-svg__label">First ionization energy and electronegativity increase ↗</text>
    {[[0,17],[0,1,12,13,14,15,16,17],[0,1,12,13,14,15,16,17],...Array.from({length:4},()=>Array.from({length:18},(_,group)=>group))].flatMap((groups, period) => groups.map((group) => {
      const x = 20 + group * 10;
      const y = 30 + period * 7;
      const fill = group < 2 ? "#dfe7dc" : group < 12 ? "#f1dfaa" : "#d9eaf5";
      return <rect key={`${period}-${group}`} x={x} y={y} width="8" height="5.5" rx="1" fill={fill} stroke="#fffaf1" strokeWidth=".7" />;
    }))}
    {Array.from({ length: 28 }, (_, index) => <rect key={"f" + index} x={50 + index % 14 * 10} y={82 + Math.floor(index / 14) * 7} width="8" height="5.5" rx="1" fill={index < 14 ? "#e7dff0" : "#d7e8dc"} stroke="#fffaf1" strokeWidth=".7" />)}
    <path d="M63 78 156 36" fill="none" stroke={green} strokeWidth="2.2" markerEnd="url(#trend-arrow)" />
    <path d="M153 40 65 79" fill="none" stroke={gold} strokeWidth="2.2" markerEnd="url(#radius-arrow)" />
    <text x="110" y="112" textAnchor="middle" className="chem-svg__label">Atomic radius increases toward the lower left ↙</text>
    <text x="110" y="126" textAnchor="middle" className="chem-svg__label">Periodic table trend directions</text>
  </>;
  if (type === "ion") return <><circle cx="88" cy="64" r="27" fill="none" stroke={quiet} strokeWidth="1.5" /><circle cx="88" cy="64" r="11" fill={pink} /><circle cx="62" cy="64" r="5" fill={blue} /><circle cx="114" cy="64" r="5" fill={blue} /><path d="M132 64H176m-6-5 6 5-6 5" stroke={green} strokeWidth="2" fill="none" /><text x="153" y="52" textAnchor="middle" className="chem-svg__label">e−</text><text x="110" y="111" textAnchor="middle" className="chem-svg__label">gain or lose electrons</text></>;
  if (type === "ionic-lattice") return <>{Array.from({length:8},(_,i)=>{const x=52+(i%4)*39,y=43+Math.floor(i/4)*38;const plus=(i+Math.floor(i/4))%2===0;return <g key={i}><circle cx={x} cy={y} r="12" fill={plus?pink:blue}/><text x={x} y={y+4} textAnchor="middle" className="chem-svg__label">{plus?"+":"−"}</text></g>})}<text x="110" y="119" textAnchor="middle" className="chem-svg__label">extended ionic lattice · NaCl</text></>;
  if (type === "ionic-drawing") return <>
    <path d="M49 37v57m0-57h8m-8 57h8M91 37v57m0-57h-8m8 57h-8M121 37v57m0-57h8m-8 57h8M173 37v57m0-57h-8m8 57h-8" fill="none" stroke={quiet} strokeWidth="2" />
    <text x="70" y="71" textAnchor="middle" className="chem-svg__atom-label">Na</text>
    <text x="97" y="45" textAnchor="middle" className="chem-svg__charge-label">+</text>
    <text x="147" y="71" textAnchor="middle" className="chem-svg__atom-label">Cl</text>
    <text x="180" y="45" textAnchor="middle" className="chem-svg__charge-label">−</text>
    {[[140,49],[153,49],[140,88],[153,88],[129,59],[129,77],[164,59],[164,77]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.5" fill={green} />)}
    <text x="110" y="116" textAnchor="middle" className="chem-svg__label">[Na]⁺   [Cl]⁻ · 8 electron dots around chloride</text>
  </>;
  if (type === "covalent-bond") return <><circle cx="70" cy="63" r="19" fill={pink} /><circle cx="150" cy="63" r="19" fill={blue} /><circle cx="105" cy="63" r="3.5" fill={gold} /><circle cx="115" cy="63" r="3.5" fill={gold} /><text x="70" y="67" textAnchor="middle" className="chem-svg__atom-label">H</text><text x="150" y="67" textAnchor="middle" className="chem-svg__atom-label">H</text><text x="110" y="116" textAnchor="middle" className="chem-svg__label">H₂ · one shared electron pair</text></>;
  if (type === "lewis-water") return <>
    <text x="110" y="68" textAnchor="middle" className="chem-svg__atom-label">O</text>
    <text x="57" y="89" textAnchor="middle" className="chem-svg__atom-label">H</text>
    <text x="163" y="89" textAnchor="middle" className="chem-svg__atom-label">H</text>
    <path d="M92 70 69 83m59-13 23 13" stroke={ink} strokeWidth="2.5" />
    {[[102,39],[118,39],[102,54],[118,54],[74,61],[68,55],[146,61],[152,55]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill={green}/>) }
    <text x="110" y="119" textAnchor="middle" className="chem-svg__label">H₂O · two bonds · two lone pairs on oxygen</text>
  </>;
  if (type === "lewis") return <><circle cx="110" cy="65" r="22" fill="none" stroke={quiet} strokeWidth="1.5" /><text x="110" y="70" textAnchor="middle" className="chem-svg__atom-label">O</text>{[[110,31],[110,99],[75,65],[145,65],[86,41],[134,41]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill={green}/>) }<text x="110" y="120" textAnchor="middle" className="chem-svg__label">valence electrons · bonds and lone pairs</text></>;
  if (type === "resonance") return <>
    <g className="chem-svg__atom-label">
      <text x="42" y="70" textAnchor="middle">O</text><text x="92" y="70" textAnchor="middle">O</text><text x="142" y="70" textAnchor="middle">O</text>
      <text x="207" y="70" textAnchor="middle">O</text><text x="257" y="70" textAnchor="middle">O</text><text x="307" y="70" textAnchor="middle">O</text>
    </g>
    <text x="36" y="51" className="chem-svg__charge-label">−</text><text x="87" y="51" className="chem-svg__charge-label">+</text>
    <text x="252" y="51" className="chem-svg__charge-label">+</text><text x="302" y="51" className="chem-svg__charge-label">−</text>
    <path d="M52 65H81M103 65H132m-29-4v8m5-8v8M217 65H246m-29-4v8m5-8v8M268 65H297" stroke={ink} strokeWidth="2" fill="none" />
    <text x="179" y="70" textAnchor="middle" className="chem-svg__atom-label">↔</text>
    <text x="160" y="108" textAnchor="middle" className="chem-svg__label">O₃ · same atom positions · only electrons move</text>
  </>;
  if (type === "geometry") return <><circle cx="110" cy="66" r="12" fill={green} /><path d="M110 54 77 29M121 66l35-1M101 76l-13 29M119 76l14 29" stroke={quiet} strokeWidth="2" /><g fill={blue}><circle cx="77" cy="29" r="7"/><circle cx="156" cy="65" r="7"/><circle cx="88" cy="105" r="7"/><circle cx="133" cy="105" r="7"/></g><text x="110" y="126" textAnchor="middle" className="chem-svg__label">tetrahedral · rotate the three-dimensional methane model</text></>;
  if (type === "dipole" || type === "molecular-dipole") return <><circle cx="75" cy="63" r="20" fill={pink}/><circle cx="145" cy="63" r="15" fill={blue}/><text x="75" y="67" textAnchor="middle" className="chem-svg__label">δ+</text><text x="145" y="67" textAnchor="middle" className="chem-svg__label">δ−</text><path d="M99 49H126m-6-5 6 5-6 5" stroke={green} strokeWidth="2" fill="none"/><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{type === "dipole" ? "toward more electronegative atom" : "vector sum sets polarity"}</text></>;
  if (type === "dispersion" || type === "dipole-pair" || type === "hydrogen-bond" || type === "ion-dipole" || type === "solvation") return <><circle cx="70" cy="62" r="20" fill={pink}/><circle cx="103" cy="62" r="18" fill={blue}/><circle cx="143" cy="62" r="20" fill={gold}/><text x="70" y="66" textAnchor="middle" className="chem-svg__label">{type === "ion-dipole" || type === "solvation" ? "+" : "δ+"}</text><text x="103" y="66" textAnchor="middle" className="chem-svg__label">δ−</text><text x="143" y="66" textAnchor="middle" className="chem-svg__label">{type === "hydrogen-bond" ? "H" : "δ+"}</text><path d="M119 36H135" stroke={green} strokeWidth="2" strokeDasharray="3 3"/><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{type.replaceAll("-", " ")}</text></>;
  if (type === "reaction" || type === "precipitation" || type === "redox" || type === "energy-barrier" || type === "observation") return <><g fill={blue}><circle cx="51" cy="54" r="9"/><circle cx="72" cy="72" r="9"/></g><path d="M91 63H133m-7-6 7 6-7 6" fill="none" stroke={green} strokeWidth="2"/>{type === "precipitation" ? <><circle cx="151" cy="50" r="7" fill={pink}/><circle cx="172" cy="50" r="7" fill={gold}/><path d="M145 88h34" stroke={ink} strokeWidth="5" strokeLinecap="round"/></> : type === "energy-barrier" ? <path d="M143 82c13-2 8-36 22-40 12 4 7 38 21 40" fill="none" stroke={gold} strokeWidth="3"/> : <g fill={pink}><circle cx="151" cy="54" r="9"/><circle cx="173" cy="72" r="9"/></g>}<text x="110" y="115" textAnchor="middle" className="chem-svg__label">{type.replaceAll("-", " ")}</text></>;
  return <><circle cx="110" cy="55" r="28" fill="none" stroke={green} strokeWidth="2" /><path d="M95 55h30m-15-15v30" stroke={green} strokeWidth="2" /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">chemistry</text></>;
}

export default function ChemIllustration({ type, animated = false, annotations = [] }) {
  const description = type === "isotopes"
    ? "Hydrogen isotopes with the same number of protons and different numbers of neutrons"
    : type === "coulomb"
      ? "Opposite charges attract; attraction depends on charge and distance"
      : type === "orbitals" && animated
        ? "Animated orbital filling from lower to higher energy"
        : (type || "Chemistry concept").replaceAll("-", " ");
  if (type === "orbitals" && animated) return <div className="chem-figure"><AufbauDiagram animated /></div>;
  if (type === "tetrahedral-3d") return <Molecule3D />;
  const viewBox = type === "resonance" ? "0 0 320 132"
    : type === "oxygen-orbital" ? "0 0 220 150"
      : type === "atom" && annotations.length ? "0 0 470 150"
        : "0 0 220 132";
  const accessibleDescription = annotations.length ? `${description}: ${annotations.join("; ")}` : description;
  return <figure className="chem-figure"><svg className="chem-svg" viewBox={viewBox} role="img" aria-label={accessibleDescription}><VisualBody type={type} annotations={annotations} /></svg></figure>;
}
