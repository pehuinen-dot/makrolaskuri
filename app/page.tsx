import React, { useState } from 'react';

export default function Makrolaskuri() {
  const [formData, setFormData] = useState({
    pituus: 175,
    paino: 90,
    tavoitepaino: 82,
    aktiivisuus: '6-7',
    ruokavalio: 'sekasyoja',
    tavoite: 'rasvanpoltto'
  });

  const dietOptions = [
    { value: 'sekasyoja', label: 'Sekasyöjä (Kaikkiruokainen)' },
    { value: 'kasvis', label: 'Kasvisruokavalio (Lacto-ovo)' },
    { value: 'vegaani', label: 'Vegaani' },
    { value: 'peskateriaani', label: 'Peskateriaani (Kala-kasvis)' },
    { value: 'gluteeniton', label: 'Gluteeniton' },
    { value: 'maidoton', label: 'Maidoton' },
    { value: 'keto', label: 'Keto / Vähähiilihydraattinen' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Lasketaan makrot tiedoilla:', formData);
    // Tähän makrolaskenta-logiikka
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#121824] text-white rounded-2xl shadow-xl font-sans">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Pituus */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            PITUUS (CM)
          </label>
          <input
            type="number"
            name="pituus"
            value={formData.pituus}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Nykyinen paino */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            NYKYINEN PAINO (KG)
          </label>
          <input
            type="number"
            name="paino"
            value={formData.paino}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tavoitepaino */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            TAVOITEPAINO (KG)
          </label>
          <input
            type="number"
            name="tavoitepaino"
            value={formData.tavoitepaino}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Aktiivisuus */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            AKTIIVISUUS
          </label>
          <select
            name="aktiivisuus"
            value={formData.aktiivisuus}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="1-3">Kevyt liikunta (1–3 krt/vko)</option>
            <option value="3-5">Kohtalainen urheilu (3–5 krt/vko)</option>
            <option value="6-7">Aktiivinen urheilu (6–7 krt/vko)</option>
          </select>
        </div>

        {/* Ruokavalio (Korjattu kohta) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            RUOKAVALIO
          </label>
          <select
            name="ruokavalio"
            value={formData.ruokavalio}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-emerald-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            {dietOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tavoite */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            TAVOITE
          </label>
          <select
            name="tavoite"
            value={formData.tavoite}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="rasvanpoltto">Rasvanpoltto (-500 kcal/pvä)</option>
            <option value="yllapito">Painon ylläpito</option>
            <option value="lihaskasvu">Lihaskasvu (+300 kcal/pvä)</option>
          </select>
        </div>

        {/* Painike */}
        <button
          type="submit"
          className="w-full py-4 mt-2 px-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold rounded-xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          🚀 Laske makrot & näytä ruokavalio
        </button>
      </form>
    </div>
  );
}
