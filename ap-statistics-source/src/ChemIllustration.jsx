import React from "react";

const ink = "#514d43";
const quiet = "#9a9487";
const green = "#587565";
const blue = "#69b9e8";
const pink = "#f28aaa";
const gold = "#eab24d";

function Atom({ x, neutrons = 1, label = "" }) {
  return (
    <g>
      <circle cx={x} cy="61" r="25" fill="none" stroke={quiet} strokeWidth="1.5" />
      <circle cx={x} cy="36" r="4" fill={blue} />
      <circle cx={x - (neutrons ? 4 : 0)} cy="61" r="6" fill={pink} />
      <text x={x - (neutrons ? 4 : 0)} y="63.5" textAnchor="middle" className="chem-svg__tiny">p+</text>
      {Array.from({ length: neutrons }, (_, i) => (
        <g key={i}>
          <circle cx={x + 5 + (i % 2) * 5} cy={55 + Math.floor(i / 2) * 9} r="5.3" fill={gold} />
          <text x={x + 5 + (i % 2) * 5} y={57.5 + Math.floor(i / 2) * 9} textAnchor="middle" className="chem-svg__tiny">n</text>
        </g>
      ))}
      {label ? <text x={x} y="105" textAnchor="middle" className="chem-svg__label">{label}</text> : null}
    </g>
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

function VisualBody({ type }) {
  if (type === "atom") {
    return <><circle cx="110" cy="66" r="37" fill="none" stroke={quiet} strokeWidth="1.5" /><circle cx="110" cy="29" r="5" fill={blue} /><circle cx="106" cy="66" r="9" fill={pink} /><circle cx="115" cy="66" r="8" fill={gold} /><text x="106" y="69" textAnchor="middle" className="chem-svg__tiny">p+</text><text x="115" y="69" textAnchor="middle" className="chem-svg__tiny">n</text><text x="110" y="119" textAnchor="middle" className="chem-svg__label">nucleus + electrons</text></>;
  }
  if (type === "isotopes") return <>{[0, 1, 2].map((n) => <Atom key={n} x={48 + n * 62} neutrons={n} label={"H-" + (n + 1)} />)}<text x="110" y="122" textAnchor="middle" className="chem-svg__label">same #p+ · different #n⁰</text></>;
  if (type === "weighted-mass") return <><path d="M32 92H188M44 92V38M93 92V57M142 92V27" stroke={quiet} strokeWidth="2" /><circle cx="44" cy="38" r="5" fill={blue} /><circle cx="93" cy="57" r="5" fill={pink} /><circle cx="142" cy="27" r="5" fill={gold} /><path d="M58 106H167m-1-4 5 4-5 4" stroke={green} strokeWidth="2" fill="none" /><text x="109" y="125" textAnchor="middle" className="chem-svg__label">isotope masses × fractions → mean</text></>;
  if (type === "spectrum") return <><path d="M34 101V27M34 101H193" stroke={ink} strokeWidth="1.5" /><path d="M64 100V73M93 100V39M128 100V55M166 100V78" stroke={blue} strokeWidth="9" strokeLinecap="round" /><text x="19" y="54" transform="rotate(-90 19 54)" className="chem-svg__label">signal</text><text x="186" y="116" className="chem-svg__label">m/z</text></>;
  if (type === "particles") return <><g fill={[blue, pink, gold, green, blue, pink]}>{[[70,45],[103,42],[136,48],[84,78],[119,82],[151,76]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="9" />)}</g><text x="110" y="116" textAnchor="middle" className="chem-svg__label">1 mol = 6.022 × 10²³</text></>;
  if (type === "composition") return <><circle cx="110" cy="63" r="34" fill="none" stroke={blue} strokeWidth="16" strokeDasharray="72 142" transform="rotate(-90 110 63)" /><circle cx="110" cy="63" r="34" fill="none" stroke={gold} strokeWidth="16" strokeDasharray="42 172" strokeDashoffset="-72" transform="rotate(-90 110 63)" /><circle cx="110" cy="63" r="34" fill="none" stroke={pink} strokeWidth="16" strokeDasharray="28 186" strokeDashoffset="-114" transform="rotate(-90 110 63)" /><text x="110" y="116" textAnchor="middle" className="chem-svg__label">part ÷ whole × 100%</text></>;
  if (type === "ratio") return <><g fill={blue}>{[0,1,2].map((i)=><circle key={"a"+i} cx={55+i*25} cy="55" r="8" />)}</g><g fill={gold}>{[0,1].map((i)=><circle key={"b"+i} cx={135+i*25} cy="55" r="8" />)}</g><path d="M48 84H172" stroke={quiet} strokeWidth="1.5" /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">reduce to lowest whole numbers</text></>;
  if (type === "orbitals") return <AufbauDiagram animated={false} />;
  if (type === "paired-orbital" || type === "hund-orbitals") {
    const paired = type === "paired-orbital";
    return <><text x="110" y="28" textAnchor="middle" className="chem-svg__label">{paired ? "one orbital" : "equal-energy orbitals"}</text><OrbitalBoxes x={paired ? 92 : 38} y={58} count={paired ? 1 : 3} paired={paired} /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{paired ? "max 2 · opposite spins" : "occupy singly before pairing"}</text></>;
  }
  if (type === "energy-levels") return <><path d="M47 101V31m-4 6 4-6 4 6" fill="none" stroke={ink} strokeWidth="1.7" /><path d="M73 91H171M73 61H171M73 34H171" stroke={quiet} strokeWidth="2" /><text x="60" y="95" textAnchor="end" className="chem-svg__label">E₁</text><text x="60" y="65" textAnchor="end" className="chem-svg__label">E₂</text><path d="M120 84V66m-4 5 4-5 4 5" fill="none" stroke={blue} strokeWidth="2.5" /><text x="110" y="120" textAnchor="middle" className="chem-svg__label">same #e− · higher energy</text></>;
  if (type === "coulomb") return <><circle cx="58" cy="65" r="19" fill={pink} /><text x="58" y="69" textAnchor="middle" className="chem-svg__label">+Z</text><circle cx="164" cy="65" r="11" fill={blue} /><text x="164" y="69" textAnchor="middle" className="chem-svg__label">e−</text><path d="M88 59H135m-6-5 6 5-6 5M135 72H88m6-5-6 5 6 5" fill="none" stroke={green} strokeWidth="2" /><text x="110" y="112" textAnchor="middle" className="chem-svg__label">opposite charges attract</text></>;
  if (type === "periodic-trend") return <><rect x="62" y="30" width="96" height="62" rx="6" fill="none" stroke={quiet} strokeWidth="1.5" /><path d="M72 78H147m-6-5 6 5-6 5M74 79V43m-5 6 5-6 5 6" fill="none" stroke={green} strokeWidth="2" /><text x="111" y="111" textAnchor="middle" className="chem-svg__label">across → · down ↓</text></>;
  if (type === "ion") return <><circle cx="88" cy="64" r="27" fill="none" stroke={quiet} strokeWidth="1.5" /><circle cx="88" cy="64" r="11" fill={pink} /><circle cx="62" cy="64" r="5" fill={blue} /><circle cx="114" cy="64" r="5" fill={blue} /><path d="M132 64H176m-6-5 6 5-6 5" stroke={green} strokeWidth="2" fill="none" /><text x="153" y="52" textAnchor="middle" className="chem-svg__label">e−</text><text x="110" y="111" textAnchor="middle" className="chem-svg__label">gain or lose electrons</text></>;
  if (type === "ionic-lattice") return <>{Array.from({length:8},(_,i)=>{const x=52+(i%4)*39,y=43+Math.floor(i/4)*38;const plus=(i+Math.floor(i/4))%2===0;return <g key={i}><circle cx={x} cy={y} r="12" fill={plus?pink:blue}/><text x={x} y={y+4} textAnchor="middle" className="chem-svg__label">{plus?"+":"−"}</text></g>})}<text x="110" y="119" textAnchor="middle" className="chem-svg__label">extended ionic lattice</text></>;
  if (type === "covalent-bond") return <><circle cx="70" cy="63" r="19" fill={pink} /><circle cx="150" cy="63" r="19" fill={blue} /><circle cx="101" cy="55" r="4" fill={gold} /><circle cx="110" cy="55" r="4" fill={gold} /><circle cx="119" cy="55" r="4" fill={gold} /><circle cx="101" cy="71" r="4" fill={gold} /><circle cx="110" cy="71" r="4" fill={gold} /><circle cx="119" cy="71" r="4" fill={gold} /><text x="110" y="116" textAnchor="middle" className="chem-svg__label">shared electron pair(s)</text></>;
  if (type === "lewis") return <><circle cx="110" cy="65" r="22" fill="none" stroke={quiet} strokeWidth="1.5" /><text x="110" y="70" textAnchor="middle" className="chem-svg__label">X</text>{[[110,31],[110,99],[75,65],[145,65],[86,41],[134,41]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill={green}/>) }<text x="110" y="120" textAnchor="middle" className="chem-svg__label">bonds + lone pairs</text></>;
  if (type === "resonance") return <><text x="41" y="67" className="chem-svg__label">A=B—C</text><path d="M97 62H123m-6-5 6 5-6 5" stroke={green} strokeWidth="1.8" fill="none" /><text x="136" y="67" className="chem-svg__label">A—B=C</text><text x="110" y="112" textAnchor="middle" className="chem-svg__label">same atom positions</text></>;
  if (type === "geometry") return <><circle cx="110" cy="66" r="12" fill={green} /><path d="M110 54 77 29M121 66l35-1M101 76l-13 29M119 76l14 29" stroke={quiet} strokeWidth="2" /><g fill={blue}><circle cx="77" cy="29" r="7"/><circle cx="156" cy="65" r="7"/><circle cx="88" cy="105" r="7"/><circle cx="133" cy="105" r="7"/></g><text x="110" y="126" textAnchor="middle" className="chem-svg__label">3D arrangement</text></>;
  if (type === "dipole" || type === "molecular-dipole") return <><circle cx="75" cy="63" r="20" fill={pink}/><circle cx="145" cy="63" r="15" fill={blue}/><text x="75" y="67" textAnchor="middle" className="chem-svg__label">δ+</text><text x="145" y="67" textAnchor="middle" className="chem-svg__label">δ−</text><path d="M99 49H126m-6-5 6 5-6 5" stroke={green} strokeWidth="2" fill="none"/><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{type === "dipole" ? "toward more electronegative atom" : "vector sum sets polarity"}</text></>;
  if (type === "dispersion" || type === "dipole-pair" || type === "hydrogen-bond" || type === "ion-dipole" || type === "solvation") return <><circle cx="70" cy="62" r="20" fill={pink}/><circle cx="103" cy="62" r="18" fill={blue}/><circle cx="143" cy="62" r="20" fill={gold}/><text x="70" y="66" textAnchor="middle" className="chem-svg__label">{type === "ion-dipole" || type === "solvation" ? "+" : "δ+"}</text><text x="103" y="66" textAnchor="middle" className="chem-svg__label">δ−</text><text x="143" y="66" textAnchor="middle" className="chem-svg__label">{type === "hydrogen-bond" ? "H" : "δ+"}</text><path d="M119 36H135" stroke={green} strokeWidth="2" strokeDasharray="3 3"/><text x="110" y="111" textAnchor="middle" className="chem-svg__label">{type.replaceAll("-", " ")}</text></>;
  if (type === "reaction" || type === "precipitation" || type === "redox" || type === "energy-barrier" || type === "observation") return <><g fill={blue}><circle cx="51" cy="54" r="9"/><circle cx="72" cy="72" r="9"/></g><path d="M91 63H133m-7-6 7 6-7 6" fill="none" stroke={green} strokeWidth="2"/>{type === "precipitation" ? <><circle cx="151" cy="50" r="7" fill={pink}/><circle cx="172" cy="50" r="7" fill={gold}/><path d="M145 88h34" stroke={ink} strokeWidth="5" strokeLinecap="round"/></> : type === "energy-barrier" ? <path d="M143 82c13-2 8-36 22-40 12 4 7 38 21 40" fill="none" stroke={gold} strokeWidth="3"/> : <g fill={pink}><circle cx="151" cy="54" r="9"/><circle cx="173" cy="72" r="9"/></g>}<text x="110" y="115" textAnchor="middle" className="chem-svg__label">{type.replaceAll("-", " ")}</text></>;
  return <><circle cx="110" cy="55" r="28" fill="none" stroke={green} strokeWidth="2" /><path d="M95 55h30m-15-15v30" stroke={green} strokeWidth="2" /><text x="110" y="111" textAnchor="middle" className="chem-svg__label">chemistry</text></>;
}

export default function ChemIllustration({ type, animated = false }) {
  const description = type === "isotopes"
    ? "Hydrogen isotopes with the same proton count and different neutron counts"
    : type === "coulomb"
      ? "Opposite charges attract; attraction depends on charge and distance"
      : type === "orbitals" && animated
        ? "Animated orbital filling from lower to higher energy"
        : (type || "Chemistry concept").replaceAll("-", " ");
  if (type === "orbitals" && animated) return <div className="chem-figure"><AufbauDiagram animated /></div>;
  return <figure className="chem-figure"><svg className="chem-svg" viewBox="0 0 220 132" role="img" aria-label={description}><VisualBody type={type} /></svg></figure>;
}
