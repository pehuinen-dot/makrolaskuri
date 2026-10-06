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
  const [diet, setDiet] = useState<string>("sekasyöjä");
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

    // Rasva: Ketolla enemmän, muuten ~25%
    const fatCalories = diet === "keto" ? targetCalories * 0.70 : targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    // Hiilihydraatti
    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbGrams = Math.round(carbCalories / 4);

    // Kuitu: min 30g
    const fiberGrams = Math.max(30, Math.round((targetCalories / 1000) * 14));

    // Painoennuste
    const weightDiff = numWeight - numTargetWeight;
    const totalCalorieDiff = weightDiff * 7700;
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

    const calculatedMeals = generateMealPlan(diet);

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

  const generateMealPlan = (selectedDiet: string) => {
    if (selectedDiet === "vegaani") {
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
            "180g kiinteää tofua marinoituna",
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

    if (selectedDiet === "kasvis") {
      return {
        breakfast: {
          name: "Kreikkalainen jogurtti, mysli & marjat",
          ingredients: [
            "250g kreikkalaista jogurttia",
            "40g täysjyvämysliä",
            "100g vadelmia tai mansikoita",
            "1 rkl hunajaa",
          ],
        },
        lunch: {
          name: "Halloumi-kvinoasalaatti",
          ingredients: [
            "140g halloumijuustoa paistettuna",
            "75g kvinoaa (kuivapaino)",
            "Tuorekurkkua, tomaattia ja salaattisekoitusta",
            "1 rkl oliiviöljy-sitruunakastiketta",
          ],
        },
        dinner: {
          name: "Pinaatti-fetapasta",
          ingredients: [
            "80g täysjyväpastaa",
            "100g fetajuustoa murusteltuna",
            "100g tuoretta pinaattia",
            "Kirsikkatomaatteja ja valkosipulia",
          ],
        },
        snack: {
          name: "Raejuustoa & hedelmiä",
          ingredients: [
            "200g raejuustoa",
            "1 pilkottu omena tai päärynä",
            "Ripaus kanelia ja muutama manteli",
          ],
        },
      };
    }

    if (selectedDiet === "keto") {
      return {
        breakfast: {
          name: "Muna-pekoniaamiainen & avokado",
          ingredients: [
            "3 paistettua kananmunaa",
            "60g pekonia rapeaksi paistettuna",
            "1 kokonainen avokado viipaloituna",
            "Kourallinen tuoretta pinaattia",
          ],
        },
        lunch: {
          name: "Kana-fetavuohenjuustosalaatti öljyllä",
          ingredients: [
            "180g broilerin rintafileetä",
            "50g fetajuustoa tai vuohenjuustoa",
            "Iso salaattipohja (salaattia, kurkkua)",
            "3 rkl laadukasta oliiviöljyä tai MCT-öljyä",
          ],
        },
        dinner: {
          name: "Rasvainen lohifilee & parsakaalia",
          ingredients: [
            "200g merilohta uunissa",
            "150g parsakaalia voissa paistettuna",
            "Kastike: 50g ranskankermaa (crème fraîche) & tilliä",
          ],
        },
        snack: {
          name: "Avokado-rahkamousse tai pähkinät",
          ingredients: [
            "150g täysrasvaista rahkaa",
            "30g makadamiapähkinöitä",
            "Tilkka kuohukermaa",
          ],
        },
      };
    }

    if (selectedDiet === "gluteeniton") {
      return {
        breakfast: {
          name: "Gluteeniton puuro & marjat",
          ingredients: [
            "80g gluteenittomia kaurahiutaleita",
            "30g heraproteiinia (tai 150g raejuustoa)",
            "100g marjoja",
            "15g siemeniä",
          ],
        },
        lunch: {
          name: "Kana-riisikulho & kasvikset",
          ingredients: [
            "180g broilerin rintafileetä",
            "75g riisiä tai kvinoaa",
            "150g höyrytettyjä kasviksia",
            "10g oliiviöljyä",
          ],
        },
        dinner: {
          name: "Naudanliha-perunamuusi",
          ingredients: [
            "180g naudan paistijauhelihaa (10%)",
            "250g perunoita muusiksi tehtynä",
            "Tuoretta salaattia",
          ],
        },
        snack: {
          name: "Gluteeniton välipala",
          ingredients: [
            "250g maitorahkaa",
            "1 banaani",
            "Kourallinen saksanpähkinöitä",
          ],
        },
      };
    }

    // Oletus: Sekasyöjä
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
          "180g broilerin rintafileetä",
          "75g tummaa riisiä (kuivapaino)",
          "150g höyrytettyjä kasviksia",
          "10g oliiviöljyä tai pähkinäöljyä",
        ],
      },
      dinner: {
        name: "Jauhelihakastike & perunat",
        ingredients: [
          "180g naudan jauhelihaa (10%)",
          "250g kuorittuja perunoita",
          "Runsaasti tuoresalaattia & kurkkua",
          "1 rkl salaatinkastiketta",
        ],
      },
      snack: {
        name: "Rahka / Raejuusto & ruisleipä",
        ingredients: [
          "250g rasvatonta maitorahkaa tai raejuustoa",
          "100g marjoja tai 1 omena",
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
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Otsikko */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900">
            Makrolaskuri & Ruokavalio
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto">
            Laske henkilökohtaiset kalori- ja makrotavoitteesi sekä saa heti 1 päivän esimerkkiruokavalio sähköpostiisi.
          </p>
        </div>

        {/* Syöteosio */}
        <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-amber-800 border-b border-stone-100 pb-3">
            1. Syötä tietosi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sukupuoli */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Sukupuoli
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              >
                <option value="male">Mies</option>
                <option value="female">Nainen</option>
              </select>
            </div>

            {/* Ikä */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Ikä (v)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              />
            </div>

            {/* Pituus */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Pituus (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              />
            </div>

            {/* Nykyinen paino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Nykyinen paino (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tavoitepaino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Tavoitepaino (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              />
            </div>

            {/* Aktiivisuustaso */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Aktiivisuus
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Ruokavalion tyyppi
              </label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              >
                <option value="sekasyöjä">Sekasyöjä</option>
                <option value="kasvis">Kasvisruokavalio</option>
                <option value="vegaani">Vegaani</option>
                <option value="keto">Keto (Ketogeeninen)</option>
                <option value="gluteeniton">Gluteeniton</option>
              </select>
            </div>

            {/* Tavoite / Kalorivaje */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Tavoite
              </label>
              <select
                value={goalPreset}
                onChange={(e) => setGoalPreset(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Mukautettu kalorimuutos (kcal/pvä, esim. -400 tai +200)
              </label>
              <input
                type="number"
                value={customDeficit}
                onChange={(e) => setCustomDeficit(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-700"
              />
            </div>
          )}

          <button
            onClick={calculateMacros}
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-4 rounded-xl shadow-md transition transform active:scale-95 text-lg mt-4"
          >
            Laske makrot & näytä ruokavalio
          </button>
        </div>

        {/* Tulokset & Ruokavalio */}
        {results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Kortti: Tulokset */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-amber-800 border-b border-stone-100 pb-3">
                2. Henkilökohtaiset tuloksesi
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Tavoitekalorit</div>
                  <div className="text-2xl font-black text-amber-800 mt-1">{results.targetCalories}</div>
                  <div className="text-xs text-stone-400">kcal / pvä</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Proteiini</div>
                  <div className="text-2xl font-black text-stone-800 mt-1">{results.proteinGrams}g</div>
                  <div className="text-xs text-stone-400">({Math.round(results.proteinGrams * 4)} kcal)</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Rasva</div>
                  <div className="text-2xl font-black text-stone-800 mt-1">{results.fatGrams}g</div>
                  <div className="text-xs text-stone-400">({Math.round(results.fatGrams * 9)} kcal)</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Hiilihydraatti</div>
                  <div className="text-2xl font-black text-stone-800 mt-1">{results.carbGrams}g</div>
                  <div className="text-xs text-stone-400">({Math.round(results.carbGrams * 4)} kcal)</div>
                </div>
              </div>

              {results.weeksToGoal > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-amber-900 font-bold text-sm">Painoennuste tavoitteeseen ({results.targetWeight} kg):</span>
                  <p className="text-stone-700 text-sm">
                    Saavutat tavoitteesi noin <strong>{results.weeksToGoal} viikossa</strong> ({results.targetDateStr} mennessä).
                  </p>
                </div>
              )}
            </div>

            {/* Kortti: Ateriaehdotus */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-amber-800 border-b border-stone-100 pb-3">
                Ehdotus 1 päivän aterioista
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(meals).map(([key, meal]: [string, Meal]) => (
                  <div key={key} className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60 space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-amber-800">
                      {key === "breakfast" ? "Aamupala" : key === "lunch" ? "Lounas" : key === "dinner" ? "Päivällinen" : "Iltapala / Välipala"}
                    </span>
                    <h3 className="font-bold text-stone-900">{meal.name}</h3>
                    <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Sähköpostin lähetysosio */}
              <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200/80 mt-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  Lähetä makrosuunnitelma sähköpostiisi
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  Syötä sähköpostiosoitteesi alle, niin lähetämme henkilökohtaisen raporttisi ja 1 päivän ruokavalion suoraan laatikkoosi.
                </p>
