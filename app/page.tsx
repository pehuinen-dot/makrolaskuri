"use client";

import React, { useState } from "react";

export default function Home() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(38);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(90);
  const [targetWeight, setTargetWeight] = useState<number>(82);
  
  const [activity, setActivity] = useState<number>(1.55);
  const [diet, setDiet] = useState<string>("omnivore");
  const [goalPreset, setGoalPreset] = useState<string>("-500");
  const [customDeficit, setCustomDeficit] = useState<number>(-500);

  const [results, setResults] = useState<any>(null);

  const calculateMacros = () => {
    // 1. BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;

    // 2. TDEE (Kulutus)
    const tdee = Math.round(bmr * activity);

    // 3. Valittu kalorimuutos
    let deficit = 0;
    if (goalPreset === "custom") {
      deficit = customDeficit;
    } else {
      deficit = parseInt(goalPreset, 10);
    }

    const targetCalories = Math.max(1200, tdee + deficit);

    // 4. Makrojen jako
    // Proteiini: 2.0g / kg
    const proteinGrams = Math.round(weight * 2.0);
    const proteinKcal = proteinGrams * 4;

    // Rasva: 25% kokonaiskaloreista (vähintään 0.8g/kg)
    let fatKcal = targetCalories * 0.25;
    let fatGrams = Math.round(fatKcal / 9);
    if (fatGrams < weight * 0.8) {
      fatGrams = Math.round(weight * 0.8);
      fatKcal = fatGrams * 9;
    }

    // Hiilihydraatit: Loput kalorit
    const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
    const carbGrams = Math.round(carbKcal / 4);

    // Kuitu (14g / 1000 kcal)
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    // 5. Painoennusteen laskenta
    const weightDiff = targetWeight - weight; // esim. 82 - 90 = -8 kg
    let weeklyChange = 0;
    let weeksToGoal = 0;
    let targetDateStr = "";

    if (deficit !== 0) {
      // 1 kg rasvaa ≈ 7700 kcal
      const dailyKcalChange = deficit;
      const weeklyKcalChange = dailyKcalChange * 7;
      weeklyChange = weeklyKcalChange / 7700; // kg/vko (miinus = pudotus, plus = lisäys)

      if ((weightDiff < 0 && deficit < 0) || (weightDiff > 0 && deficit > 0)) {
        weeksToGoal = Math.abs(Math.round(weightDiff / weeklyChange));
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + weeksToGoal * 7);
        targetDateStr = targetDate.toLocaleDateString("fi-FI", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });
      }
    }

    setResults({
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      deficit,
      proteinGrams,
      fatGrams,
      carbGrams,
      fiberGrams,
      targetWeight,
      weightDiff,
      weeklyChange: weeklyChange.toFixed(2),
      weeksToGoal,
      targetDateStr,
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
          ⚡ Makrolaskuri
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Syötä tietosi ja laske henkilökohtaiset makrosi, painoennusteesi sekä ruokavaliosi.
        </p>

        {/* LOMAKE */}
        <div className="space-y-4">
          {/* Sukupuoli */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Sukupuoli
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2.5 rounded-lg font-medium transition ${
                  gender === "male"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Mies
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2.5 rounded-lg font-medium transition ${
                  gender === "female"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Nainen
              </button>
            </div>
          </div>

          {/* Ikä, Pituus, Nykyinen Paino, Tavoitepaino */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Ikä</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pituus (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Paino (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-emerald-400 font-medium mb-1">Tavoitepaino (kg)</label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Aktiivisuustaso */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Aktiivisuustaso</label>
            <select
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value={1.2}>Kevyt (Istumatyö, ei treeniä)</option>
              <option value={1.375}>Kevyesti aktiivinen (Treeni 1-3 kertaa/vko)</option>
              <option value={1.55}>Keskiraskas (Treeni 3-5 kertaa/vko)</option>
              <option value={1.725}>Aktiivinen (Raskas treeni 6-7 kertaa/vko)</option>
              <option value={1.9}>Erittäin aktiivinen (Urheilija / fyysinen työ)</option>
            </select>
          </div>

          {/* Tavoite / Kalorivaje */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tavoite & Kalorimuutos</label>
            <select
              value={goalPreset}
              onChange={(e) => setGoalPreset(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="-1000">Tehodietti (-1000 kcal / pvä)</option>
              <option value="-750">Kireä rasvanpoltto (-750 kcal / pvä)</option>
              <option value="-500">Standardi rasvanpoltto (-500 kcal / pvä)</option>
              <option value="-300">Maltillinen rasvanpoltto (-300 kcal / pvä)</option>
              <option value="-200">Kevyt vaje (-200 kcal / pvä)</option>
              <option value="0">Painon ylläpito (0 kcal)</option>
              <option value="250">Maltillinen lihaskasvu (+250 kcal / pvä)</option>
              <option value="500">Reipas massakausi (+500 kcal / pvä)</option>
              <option value="custom">⚙️ Oma valinta (-1000 ... +1000 kcal)</option>
            </select>
          </div>

          {/* Jos valittu 'custom', näytetään liukukytkin/syöte */}
          {goalPreset === "custom" && (
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700">
              <div className="flex justify-between text-xs mb-1">
                <span>Aseta oma vaje/ylijäämä:</span>
                <span className="font-bold text-emerald-400">
                  {customDeficit > 0 ? `+${customDeficit}` : customDeficit} kcal/pvä
                </span>
              </div>
              <input
                type="range"
                min="-1000"
                max="1000"
                step="50"
                value={customDeficit}
                onChange={(e) => setCustomDeficit(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {/* Ruokavalio */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Ruokavalio</label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="omnivore">Sekasyöjä (Kaikki käy)</option>
              <option value="veggie">Kasvissyöjä (Lacto-Ovo)</option>
              <option value="vegan">Vegaani</option>
            </select>
          </div>

          <button
            onClick={calculateMacros}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg mt-2"
          >
            Laske makrot & ennuste
          </button>
        </div>

        {/* TULOKSET */}
        {results && (
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-6">
            {/* ENNUSTEKORTTI */}
            {results.weeksToGoal > 0 && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4">
                <h3 className="text-emerald-400 font-bold text-lg mb-1 flex items-center gap-2">
                  📈 Ennuste tavoitteeseesi ({results.targetWeight} kg)
                </h3>
                <p className="text-slate-300 text-sm">
                  Nykyisellä vajeella/ylijäämällä ({results.deficit} kcal/pvä) painosi muuttuu noin{" "}
                  <strong className="text-white">{Math.abs(Number(results.weeklyChange))} kg / viikko</strong>.
                </p>
                <div className="mt-3 p-3 bg-slate-900/60 rounded-lg flex justify-between items-center text-sm">
                  <span>Arvioitu kesto:</span>
                  <span className="font-bold text-emerald-400 text-base">
                    {results.weeksToGoal} viikkoa ({results.targetDateStr})
                  </span>
                </div>
              </div>
            )}

            {/* Kalorien yhteenveto */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">BMR (Lepo)</div>
                <div className="text-lg font-bold">{results.bmr} kcal</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Kulutus (TDEE)</div>
                <div className="text-lg font-bold">{results.tdee} kcal</div>
              </div>
              <div className="bg-emerald-900/40 p-3 rounded-lg border border-emerald-500/30">
                <div className="text-xs text-emerald-300">Tavoitekalorit</div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {results.targetCalories} kcal
                </div>
              </div>
            </div>

            {/* Makrot taulukko / kortit */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Päivittäiset makroravinteet
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-400">Proteiini</div>
                  <div className="text-xl font-bold text-blue-400">{results.proteinGrams} g</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-400">Rasva</div>
                  <div className="text-xl font-bold text-amber-400">{results.fatGrams} g</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-400">Hiilihydraatti</div>
                  <div className="text-xl font-bold text-emerald-400">{results.carbGrams} g</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-400">Kuitu (min)</div>
                  <div className="text-xl font-bold text-purple-400">{results.fiberGrams} g</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
