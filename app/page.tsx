"use client";

import React, { useState } from "react";

type Meal = {
  name: string;
  ingredients: string[];
};

export default function Home() {
  const [gender, setGender] = useState<"male" | "female">("male");
  
  // Käytetään merkkijonoja (string) tateissa, jotta kentän voi tyhjentää ilman nollan jäämistä
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
    // Muutetaan numeroksi vasta laskentahetkellä
    const numAge = Number(age) || 0;
    const numHeight = Number(height) || 0;
    const numWeight = Number(weight) || 0;
    const numTargetWeight = Number(targetWeight) || 0;

    if (!numWeight || !numHeight || !numAge) return;

    // 1. BMR (Mifflin-St Jeor)
    let bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge;
    bmr += gender === "male" ? 5 : -161;

    // 2. TDEE
    const tdee = Math.round(bmr * activity);

    // 3. Kalorimuutos
    let deficit = goalPreset === "custom" ? customDeficit : parseInt(goalPreset, 10);
    const targetCalories = Math.max(1200, tdee + deficit);

    // 4. Makrojen jako
    let proteinGrams = 0;
    let fatGrams = 0;
    let carbGrams = 0;

    if (diet === "keto") {
      proteinGrams = Math.round((targetCalories * 0.25) / 4);
      fatGrams = Math.round((targetCalories * 0.70) / 9);
      carbGrams = Math.round((targetCalories * 0.05) / 4);
    } else {
      proteinGrams = Math.round(numWeight * 2.0);
      const proteinKcal = proteinGrams * 4;

      let fatKcal = targetCalories * 0.25;
      fatGrams = Math.round(fatKcal / 9);
      if (fatGrams < numWeight * 0.8) {
        fatGrams = Math.round(numWeight * 0.8);
        fatKcal = fatGrams * 9;
      }

      const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
      carbGrams = Math.round(carbKcal / 4);
    }

    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    // 5. Painoennuste
    const weightDiff = numTargetWeight - numWeight;
    let weeklyChange = 0;
    let weeksToGoal = 0;
    let targetDateStr = "";

    if (deficit !== 0) {
      weeklyChange = (deficit * 7) / 7700;
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

    // Ateriamallit
    let generatedMeals: { [key: string]: Meal } = {};

    if (diet === "keto") {
      generatedMeals = {
        breakfast: {
          name: "Pekoni-munakas & avokado",
          ingredients: ["3 kpl kananmunaa", "4 viipaletta pekonia", "1 kpl avokado (150g)", "1 rkl oliiviöljyä paistamiseen", "Kourallinen pinaattia"],
        },
        lunch: {
          name: "Lohisalaatti & fetajuusto",
          ingredients: ["200g uunilohta", "60g fetajuustoa", "2 rkl kylmäpuristettua oliiviöljyä", "150g vihersalaattia & kurkkua"],
        },
        dinner: {
          name: "Jauhelihapihvit & parsaa voikastikkeessa",
          ingredients: ["200g naudan jauhelihaa (20%)", "150g parsaa", "25g voita", "50g salaattia"],
        },
        snack: {
          name: "Keto-välipala: Raejuusto & pähkinät",
          ingredients: ["200g rasvaista raejuustoa (4%)", "30g saksanpähkinöitä", "1 rkl oliiviöljyä"],
        },
      };
    } else if (diet === "vegan") {
      generatedMeals = {
        breakfast: {
          name: "Chian-siemenpuuro & pähkinävoi",
          ingredients: ["40g kaurahiutaleita", "2 rkl chian-siemeniä", "2.5 dl soijamaitoa", "30g vegaaniproteiinia", "1 rkl pähkinävoita", "100g marjoja"],
        },
        lunch: {
          name: "Tofukastike & tumma riisi",
          ingredients: ["200g maustamatonta tofua / nyhtökauraa", "70g (raakapaino) tummaa riisiä", "1 dl kevytkookosmaitoa", "150g wok-vihanneksia"],
        },
        dinner: {
          name: "Linssikastike & peruna",
          ingredients: ["1 dl keltaisia / punaisia linssejä", "250g kuorittua perunaa", "100g tomaattimurskaa", "1 rkl rypsiöljyä"],
        },
        snack: {
          name: "Soijarahka & pähkinät",
          ingredients: ["250g maustamatonta soijarahkaa", "150g pakastemustikoita", "20g manteleita"],
        },
      };
    } else {
      generatedMeals = {
        breakfast: {
          name: "Kaurapuuro proteiinilla & marjoilla",
          ingredients: ["80g kaurahiutaleita", "30g heraproteiinia (tai 150g raejuustoa)", "100g pakastemarjoja", "15g pähkinöitä / siemeniä"],
        },
        lunch: {
          name: "Kana-riisikulho & kasvikset",
          ingredients: ["180g broilerin rinta-fileetä (tai Nyhtökauraa)", "70g (raakapaino) riisiä", "150g höyrytettyjä kasviksia", "1 rkl oliiviöljyä"],
        },
        dinner: {
          name: "Uunilohi & perunat",
          ingredients: ["180g uunilohta", "250g keitettyä perunaa", "150g salaattia / vihreitä papuja", "1 rkl kevytkermaviilikastiketta"],
        },
        snack: {
          name: "Maitorahka & marjat",
          ingredients: ["250g maustamatonta maitorahkaa (0.2%)", "150g pakastemustikoita / marjoja", "20g saksanpähkinöitä"],
        },
      };
    }

    setMeals(generatedMeals);

    setResults({
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      deficit,
      proteinGrams,
      fatGrams,
      carbGrams,
      fiberGrams,
      targetWeight: numTargetWeight,
      weeklyChange: weeklyChange.toFixed(2),
      weeksToGoal,
      targetDateStr,
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !results) return;

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
      alert("Yhteysvirhe sähköpostia lähetettäessä.");
    } finally {
      setIsSending(false);
    }
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Ikä</label>
              <input
                type="text"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pituus (cm)</label>
              <input
                type="text"
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Paino (kg)</label>
              <input
                type="text"
                inputMode="numeric"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-emerald-400 font-medium mb-1">Tavoitepaino (kg)</label>
              <input
                type="text"
                inputMode="numeric"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

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
              <option value="keto">Ketogeeninen (Keto)</option>
            </select>
          </div>

          <button
            onClick={calculateMacros}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg mt-2"
          >
            Laske makrot & näytä ruokavalio
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

            {/* Makrot */}
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

            {/* 1 PÄIVÄN VALMIS ATERIASUUNNITELMA TARKKOINE MÄÄRINEEN */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-emerald-400">
                🥗 Ehdotus 1 päivän aterioista
              </h4>

              {meals.breakfast && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold uppercase text-amber-400">Aamupala</div>
                  <div className="font-semibold text-white text-base mt-0.5">{meals.breakfast.name}</div>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1 pl-4 list-disc">
                    {meals.breakfast.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meals.lunch && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold uppercase text-blue-400">Lounas</div>
                  <div className="font-semibold text-white text-base mt-0.5">{meals.lunch.name}</div>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1 pl-4 list-disc">
                    {meals.lunch.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meals.dinner && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold uppercase text-emerald-400">Päivällinen</div>
                  <div className="font-semibold text-white text-base mt-0.5">{meals.dinner.name}</div>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1 pl-4 list-disc">
                    {meals.dinner.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meals.snack && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold uppercase text-purple-400">Iltapala / Välipala</div>
                  <div className="font-semibold text-white text-base mt-0.5">{meals.snack.name}</div>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1 pl-4 list-disc">
                    {meals.snack.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SÄHKÖPOSTI & MARKKINOINTI */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-5 text-center mt-6">
              <h4 className="font-bold text-lg text-emerald-400 mb-1">
                📧 Lähetä tämä suunnitelma sähköpostiisi
              </h4>
              <p className="text-slate-300 text-xs mb-4">
                Saat tämän 1 päivän ruokavalion, makrosi ja painoennusteesi talteen sähköpostiisi!
              </p>

              {emailSent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm font-semibold">
                    ✓ Lähetetty osoitteeseen: {email}! Tarkista sähköpostisi.
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-left">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      🔥 Haluatko lisää vaihtelua ja automaattisen seurannan?
                    </p>
                    <p className="text-xs text-slate-300 mb-3">
                      Lataamalla sovelluksemme saat käyttöösi yli 200+ erilaista reseptiä, automaattisen ostoslistan sekä viikoittaisen painonseurannan.
                    </p>
                    <button
                      onClick={() => alert("Sovelluksen latauslinkki / tilaussivu aukeaa pian!")}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition"
                    >
                      Kokeile sovellusta 14 päivää ilmaiseksi →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Sähköpostiosoitteesi..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-lg transition text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {isSending ? "Lähetetään..." : "Lähetä suunnitelma"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
