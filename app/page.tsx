"use client";

import React, { useState } from "react";

// Tyyppimäärittelyt resepteille
type Recipe = {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  diets: string[]; // "omnivore", "veggie", "vegan", "keto"
  baseMacros: { p: number; f: number; c: number }; // suhteelliset painotukset
  ingredients: string[];
};

// Reseptipankki
const RECIPE_BOOK: Recipe[] = [
  // AAMUPALAT
  {
    id: "b1",
    name: "Kaurapuuro proteiinilla & marjoilla",
    category: "breakfast",
    diets: ["omnivore", "veggie"],
    baseMacros: { p: 30, f: 10, c: 60 },
    ingredients: ["Kaurahiutale", "Heraproteiini / Raejuusto", "Pakastemarjat", "Pähkinät"],
  },
  {
    id: "b2",
    name: "Munamies-Munakas & Tumma leipä",
    category: "breakfast",
    diets: ["omnivore", "veggie"],
    baseMacros: { p: 35, f: 25, c: 40 },
    ingredients: ["Kananmunat & Valkuaiset", "Ruisleipä", "Kinkku / Juusto", "Vihannekset"],
  },
  {
    id: "b3",
    name: "Keto-Eines: Pekoni-Munakas & Avokado",
    category: "breakfast",
    diets: ["keto", "omnivore"],
    baseMacros: { p: 30, f: 65, c: 5 },
    ingredients: ["Kananmunat", "Pekoni", "Avokado", "Pinaatti & Oliiviöljy"],
  },
  {
    id: "b4",
    name: "Vegaaninen Chian-siemenpuuro & Pähkinävoi",
    category: "breakfast",
    diets: ["vegan", "veggie"],
    baseMacros: { p: 20, f: 40, c: 40 },
    ingredients: ["Chian-siemenet", "Kasvimaito", "Vegaaniproteiini", "Pähkinävoi & Banaani"],
  },

  // LOUNAT / PÄIVÄLLISET
  {
    id: "l1",
    name: "Kana-Riisikulho & Kasvikset",
    category: "lunch",
    diets: ["omnivore"],
    baseMacros: { p: 40, f: 15, c: 45 },
    ingredients: ["Broilerin rinta-filee", "Riisi / Peruna", "Lohkotut kasvikset", "Oliiviöljy"],
  },
  {
    id: "l2",
    name: "Jauheliha-Bataattilautanen",
    category: "lunch",
    diets: ["omnivore"],
    baseMacros: { p: 35, f: 25, c: 40 },
    ingredients: ["Naudan jauheliha (10%)", "Bataatti / Riisi", "Parsakaali", "Avokado"],
  },
  {
    id: "l3",
    name: "Keto-Lohisalaatti & Feta",
    category: "lunch",
    diets: ["keto", "omnivore"],
    baseMacros: { p: 30, f: 65, c: 5 },
    ingredients: ["Uunilohi", "Fetajuusto", "Oliiviöljy", "Runsas vihersalaatti & Kurkku"],
  },
  {
    id: "l4",
    name: "Tofu-Kastike & Tumma Riisi",
    category: "lunch",
    diets: ["vegan", "veggie"],
    baseMacros: { p: 30, f: 20, c: 50 },
    ingredients: ["Aito Tofu / Nyhtökaura", "Tumma riisi", "Kookosmaito (kevyt)", "Wokkivihannekset"],
  },

  // ILTAPALAT / VÄLIPALAT
  {
    id: "s1",
    name: "Maitorahka / Vegerahka & Marjat",
    category: "snack",
    diets: ["omnivore", "veggie", "vegan"],
    baseMacros: { p: 45, f: 10, c: 45 },
    ingredients: ["Maustamaton Maitorahka / Soijarahka", "Pähkinät / Mantelit", "Sekoitusmarjat"],
  },
  {
    id: "s2",
    name: "Proteiinismoothie & Pähkinät",
    category: "snack",
    diets: ["omnivore", "veggie", "vegan"],
    baseMacros: { p: 40, f: 20, c: 40 },
    ingredients: ["Proteiinijauhe", "Banaani & Pakastemustikka", "Maito / Kasvimaito", "Mandelivoi"],
  },
  {
    id: "s3",
    name: "Keto-Raejuusto & Oliiviöljy -Lautanen",
    category: "snack",
    diets: ["keto", "omnivore", "veggie"],
    baseMacros: { p: 35, f: 60, c: 5 },
    ingredients: ["Rasvainen Raejuusto", "Saksanpähkinät", "Kylmäpuristettu oliiviöljy", "Kurkku"],
  }
];

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

  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  // Valitut ateriat käyttäjälle
  const [activeMeals, setActiveMeals] = useState<{ [key: string]: Recipe }>({});
  const [results, setResults] = useState<any>(null);

  // Arvo tai hae sopiva resepti
  const getRandomRecipe = (category: "breakfast" | "lunch" | "snack", currentId?: string) => {
    const suitable = RECIPE_BOOK.filter(
      (r) => r.category === category && r.diets.includes(diet) && r.id !== currentId
    );
    if (suitable.length === 0) {
      return RECIPE_BOOK.find((r) => r.category === category) || RECIPE_BOOK[0];
    }
    return suitable[Math.floor(Math.random() * suitable.length)];
  };

  const calculateMacros = () => {
    // 1. BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
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
      proteinGrams = Math.round(weight * 2.0);
      const proteinKcal = proteinGrams * 4;

      let fatKcal = targetCalories * 0.25;
      fatGrams = Math.round(fatKcal / 9);
      if (fatGrams < weight * 0.8) {
        fatGrams = Math.round(weight * 0.8);
        fatKcal = fatGrams * 9;
      }

      const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
      carbGrams = Math.round(carbKcal / 4);
    }

    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    // 5. Ennuste
    const weightDiff = targetWeight - weight;
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

    // Valitaan alkureseptit aterioille
    setActiveMeals({
      breakfast: getRandomRecipe("breakfast"),
      lunch: getRandomRecipe("lunch"),
      dinner: getRandomRecipe("lunch"),
      snack: getRandomRecipe("snack"),
    });

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
      weeklyChange: weeklyChange.toFixed(2),
      weeksToGoal,
      targetDateStr,
    });
  };

  // Reseptin vaihtaminen dynaamisesti
  const swapMeal = (mealKey: "breakfast" | "lunch" | "dinner" | "snack", category: "breakfast" | "lunch" | "snack") => {
    const current = activeMeals[mealKey];
    const newRecipe = getRandomRecipe(category, current?.id);
    setActiveMeals((prev) => ({ ...prev, [mealKey]: newRecipe }));
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
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
            Laske makrot, ennuste & ruokavalio
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

            {/* DYNAAMINEN ATERIASUUNNITELMA & "VAIHDA ATERIA" */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-emerald-400 flex justify-between items-center">
                <span>🥗 Ehdotus päivän aterioista</span>
                <span className="text-xs text-slate-400 font-normal">Klikkaa 🔄 vaihtaaksesi reseptiä</span>
              </h4>

              {/* Aamupala */}
              {activeMeals.breakfast && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-amber-400">Aamupala</div>
                    <div className="font-semibold text-white mt-0.5">{activeMeals.breakfast.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Ainekset: {activeMeals.breakfast.ingredients.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => swapMeal("breakfast", "breakfast")}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600"
                    title="Vaihda resepti"
                  >
                    🔄
                  </button>
                </div>
              )}

              {/* Lounas */}
              {activeMeals.lunch && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-blue-400">Lounas</div>
                    <div className="font-semibold text-white mt-0.5">{activeMeals.lunch.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Ainekset: {activeMeals.lunch.ingredients.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => swapMeal("lunch", "lunch")}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600"
                    title="Vaihda resepti"
                  >
                    🔄
                  </button>
                </div>
              )}

              {/* Päivällinen */}
              {activeMeals.dinner && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-emerald-400">Päivällinen</div>
                    <div className="font-semibold text-white mt-0.5">{activeMeals.dinner.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Ainekset: {activeMeals.dinner.ingredients.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => swapMeal("dinner", "lunch")}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600"
                    title="Vaihda resepti"
                  >
                    🔄
                  </button>
                </div>
              )}

              {/* Iltapala */}
              {activeMeals.snack && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-purple-400">Iltapala / Välipala</div>
                    <div className="font-semibold text-white mt-0.5">{activeMeals.snack.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Ainekset: {activeMeals.snack.ingredients.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => swapMeal("snack", "snack")}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600"
                    title="Vaihda resepti"
                  >
                    🔄
                  </button>
                </div>
              )}
            </div>

            {/* SÄHKÖPOSTIN KERUU */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-5 text-center mt-6">
              <h4 className="font-bold text-lg text-emerald-400 mb-2">
                📧 Tilaa täydellinen 7 päivän ateriasuunnitelma & kauppalista
              </h4>
              <p className="text-slate-300 text-xs mb-4">
                Lähetämme sinulle ilmaisen PDF-oppaan, tarkan ostoslistan sekä lisää ateria-vaihtoehtoja sähköpostiisi.
              </p>

              {emailSent ? (
                <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm font-semibold">
                  ✓ Kiitos! Täydellinen 7 päivän ateriasuunnitelmasi ja kauppalistasi on lähetetty osoitteeseen: {email}
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
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-lg transition text-sm whitespace-nowrap"
                  >
                    Lähetä ilmainen opas & kauppalista
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
