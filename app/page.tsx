"use client";

import React, { useState } from "react";

type Meal = {
  name: string;
  ingredients: string[];
};

export default function Home() {
  const [gender, setGender] = useState<"male" | "female">("male");

  const [age, setAge] = useState<string>("38");
  const [height, setHeight] = useState<string>("175");
  const [weight, setWeight] = useState<string>("90");
  const [targetWeight, setTargetWeight] = useState<string>("82");

  const [activity, setActivity] = useState<number>(1.55);
  const [diet, setDiet] = useState<string>("omnivore");
  const [goalPreset, setGoalPreset] = useState<string>("-500");
  const [customDeficit, setCustomDeficit] = useState<number>(-500);

  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [meals, setMeals] = useState<{ [key: string]: Meal }>({});
  const [results, setResults] = useState<any>(null);

  const calculateMacros = () => {
    const numAge = Number(age) || 0;
    const numHeight = Number(height) || 0;
    const numWeight = Number(weight) || 0;
    const numTargetWeight = Number(targetWeight) || numWeight;

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge;
    bmr += gender === "male" ? 5 : -161;

    // TDEE
    const tdee = Math.round(bmr * activity);

    // Deficit / Surplus
    let calorieChange = 0;
    if (goalPreset === "custom") {
      calorieChange = customDeficit;
    } else {
      calorieChange = Number(goalPreset);
    }

    const targetCalories = Math.max(1200, tdee + calorieChange);

    // Proteiini: ~2g / painokilo
    const proteinGrams = Math.round(numWeight * 2);
    const proteinCalories = proteinGrams * 4;

    // Rasva: ~25% tavoitekaloreista
    const fatCalories = targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    // Hiilihydraatti: loput kalorit
    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbGrams = Math.round(carbCalories / 4);

    // Kuitu: min 30g
    const fiberGrams = Math.max(30, Math.round((targetCalories / 1000) * 14));

    // Painoennuste
    const weightDiff = numWeight - numTargetWeight;
    const totalCalorieDiff = weightDiff * 7700; // 1kg rasvaa = ~7700 kcal
    const dailyDeficit = Math.abs(calorieChange);
    
    let weeksToGoal = 0;
    let targetDateStr = "";

    if (weightDiff > 0 && dailyDeficit > 0) {
      const days = Math.round(totalCalorieDiff / dailyDeficit);
      weeksToGoal = Math.round(days / 7);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      targetDateStr = targetDate.toLocaleDateString("fi-FI", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }

    // Ateriaehdotus
    const calculatedMeals = generateMealPlan(diet, targetCalories, proteinGrams);

    setMeals(calculatedMeals);
    setResults({
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinGrams,
      fatGrams,
      carbGrams,
      fiberGrams,
      weeksToGoal,
      targetDateStr,
      targetWeight: numTargetWeight,
    });
  };

  const generateMealPlan = (selectedDiet: string, calories: number, protein: number) => {
    if (selectedDiet === "vegan") {
      return {
        breakfast: {
          name: "Kaurapuuro, nyhtökaura & pähkinät",
          ingredients: [
            "80g kaurahiutaleita",
            "100g Härkistä tai Nyhtökauraa",
            "150g marjoja",
            "20g saksanpähkinöitä",
          ],
        },
        lunch: {
          name: "Tofu-riisikulho & vihannekset",
          ingredients: [
            "180g kovaa tofut marinoituna",
            "80g tummaa riisiä (kuivapaino)",
            "150g parsakaalia ja porkkanaa",
            "1 rkl oliiviöljyä paistamiseen",
          ],
        },
        dinner: {
          name: "Linssi-kasviskastike & täysjyväpasta",
          ingredients: [
            "150g punaisia linssejä",
            "80g täysjyväpastaa",
            "200g tomaattimurskaa ja kasviksia",
            "1 rkl ravintohiivahiutaleita",
          ],
        },
        snack: {
          name: "Proteiinismoothie & kauraleipä",
          ingredients: [
            "30g kasviproteiinijauhetta (riisi/herne)",
            "1 banaani & 200ml kaurajuomaa",
            "2 viipaletta kauraleipää + hummusta",
          ],
        },
      };
    }

    return {
      breakfast: {
        name: "Kaurapuuro & heraproteiini / raejuusto",
        ingredients: [
          "80g kaurahiutaleita",
          "30g heraproteiinia (tai 150g raejuustoa)",
          "100g pakastemarjoja",
          "15g pähkinöitä / siemeniä",
        ],
      },
      lunch: {
        name: "Kana-riisikulho & kasvikset",
        ingredients: [
          "180g broilerin rinta-fileetä (tai Nyhtökauraa)",
          "75g tummaa riisiä (kuivapaino)",
          "150g höyrytettyjä kasviksia",
          "10g oliiviöljyä tai pähkinäöljyä",
        ],
      },
      dinner: {
        name: "Jauheliha- / nyhtökaurakastike & perunat",
        ingredients: [
          "180g naudan jauhelihaa (10%) tai jauhistuotetta",
          "250g kuorittuja perunoita",
          "Runsaasti tuoresalaattia & kurkkua",
          "1 rkl salaatinkastiketta",
        ],
      },
      snack: {
        name: "Rahka / Raejuusto & ruisleipä",
        ingredients: [
          "250g rasvatonta maitorahkaa tai raejuustoa",
          "100g marjoja tai 1 omenan",
          "2 viipaletta ruisleipää + sipaisu levitettä & leikkeleitä",
        ],
      },
    };
  };

  const sendEmail = async () => {
    if (!email || !email.includes("@")) {
      alert("Syötä toimiva sähköpostiosoite.");
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          results,
          meals,
        }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        alert("Sähköpostin lähetyksessä tapahtui virhe. Yritä uudelleen.");
      }
    } catch (err) {
      console.error(err);
      alert("Lähetys epäonnistui.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Otsikko */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            ⚡ Makrolaskuri & Ruokavalio
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Laske henkilökohtaiset kalori- ja makrotavoitteesi sekä saa heti 1 päivän esimerkkiruokavalio sähköpostiisi.
          </p>
        </div>

        {/* Syöteosio */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-emerald-400 border-b border-slate-800 pb-3">
            1. Syötä tietosi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sukupuoli */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sukupuoli
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Mies</option>
                <option value="female">Nainen</option>
              </select>
            </div>

            {/* Ikä */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ikä (v)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pituus */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pituus (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Nykyinen paino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nykyinen paino (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tavoitepaino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tavoitepaino (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Aktiivisuustaso */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Aktiivisuus
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value={1.2}>Kevyt (Iskutyö / vähän liikuntaa)</option>
                <option value={1.375}>Kevyt liikunta (1-3 krt/vko)</option>
                <option value={1.55}>Kohtalainen liikunta (3-5 krt/vko)</option>
                <option value={1.725}>Aktiivinen urheilu (6-7 krt/vko)</option>
                <option value={1.9}>Erittäin aktiivinen / fyysinen työ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ruokavalio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ruokavalion tyyppi
              </label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="omnivore">Sekaani (Sekasyöjä)</option>
                <option value="vegan">Vegaani</option>
              </select>
            </div>

            {/* Tavoite / Kalorivaje */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tavoite
              </label>
              <select
                value={goalPreset}
                onChange={(e) => setGoalPreset(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="-500">Rasvanpoltto (-500 kcal/pvä)</option>
                <option value="-300">Maltillinen laihtuminen (-300 kcal/pvä)</option>
                <option value="0">Painon ylläpito (0 kcal)</option>
                <option value="300">Maltillinen lihaskasvu (+300 kcal/pvä)</option>
                <option value="custom">Muu mukautettu muutos</option>
              </select>
            </div>
          </div>

          {goalPreset === "custom" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mukautettu kalorimuutos (kcal/pvä, esim. -400 tai +200)
              </label>
              <input
                type="number"
                value={customDeficit}
                onChange={(e) => setCustomDeficit(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <button
            onClick={calculateMacros}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg transition transform active:scale-95 text-lg mt-4"
          >
            🚀 Laske makrot & näytä ruokavalio
          </button>
        </div>

        {/* Tulokset & Ruokavalio */}
        {results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Kortti: Tulokset */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-teal-400 border-b border-slate-800 pb-3">
                2. Henkilökohtaiset tuloksesi
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Tavoitekalorit</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{results.targetCalories}</div>
                  <div className="text-xs text-slate-500">kcal / pvä</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Proteiini</div>
                  <div className="text-2xl font-black text-sky-400 mt-1">{results.proteinGrams}g</div>
                  <div className="text-xs text-slate-500">({Math.round(results.proteinGrams * 4)} kcal)</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Rasva</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{results.fatGrams}g</div>
                  <div className="text-xs text-slate-500">({Math.round(results.fatGrams * 9)} kcal)</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Hiilihydraatti</div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{results.carbGrams}g</div>
                  <div className="text-xs text-slate-500">({Math.round(results.carbGrams * 4)} kcal)</div>
                </div>
              </div>

              {results.weeksToGoal > 0 && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center space-y-1">
                  <span className="text-emerald-400 font-bold text-sm">📈 Painoennuste tavoitteeseen ({results.targetWeight} kg):</span>
                  <p className="text-slate-200 text-sm">
                    Saavutat tavoitteesi noin <strong>{results.weeksToGoal} viikossa</strong> ({results.targetDateStr} mennessä).
                  </p>
                </div>
              )}
            </div>

            {/* Kortti: Ateriaehdotus */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-emerald-400 border-b border-slate-800 pb-3">
                🍱 Ehdotus 1 päivän aterioista
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(meals).map(([key, meal]: [string, Meal]) => (
                  <div key={key} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                      {key === "breakfast" ? "Aamupala" : key === "lunch" ? "Lounas" : key === "dinner" ? "Päivällinen" : "Iltapala / Välipala"}
                    </span>
                    <h3 className="font-bold text-slate-100">{meal.name}</h3>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Sähköpostin lähetysosio */}
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 mt-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-slate-100">
                  📩 Lähetä makrosuunnitelma sähköpostiisi
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Syötä sähköpostiosoitteesi alle, niin lähetämme henkilökohtaisen raporttisi ja 1 päivän ruokavalion suoraan laatikkoosi.
                </p>

                {emailSent ? (
                  <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-4 rounded-xl font-semibold text-sm">
                    ✅ Suunnitelma lähetetty! Tarkista sähköpostisi (myös roskapostikansio).
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                    <input
                      type="email"
                      placeholder="sähköposti@esimerkki.fi"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={sendEmail}
                      disabled={isSending}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-3 rounded-xl transition"
                    >
                      {isSending ? "Lähetetään..." : "Lähetä raportti"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
