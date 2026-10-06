"use client";

import React, { useState } from "react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

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

    // Kuitu: min 30g tai suhteutettu kaloreihin
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

    const calculatedMeals = generateDynamicMealPlan(diet, targetCalories, numWeight);

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

  const generateDynamicMealPlan = (selectedDiet: string, calories: number, bodyWeight: number) => {
    // Skaalauskerroin perustuen kaloritasoon (verrattuna 2000 kcal perusasetukseen)
    const scale = calories / 2000;
    
    // Proteiinin lähteet skaalautuvat kehonpainon / proteiinitarpeen mukaan
    const meatGrams = Math.round(160 * (bodyWeight / 80));
    const fishGrams = Math.round(180 * (bodyWeight / 80));
    const carbSourceGrams = Math.round(75 * scale);
    const oatsGrams = Math.round(70 * scale);

    if (selectedDiet === "vegaani") {
      return {
        breakfast: {
          name: "Kaurapuuro, nyhtökaura & pähkinät",
          ingredients: [
            `${oatsGrams}g kaurahiutaleita`,
            `${Math.round(100 * scale)}g Härkistä tai Nyhtökauraa`,
            "150g marjoja",
            "20g saksanpähkinöitä",
          ],
        },
        lunch: {
          name: "Tofu-riisikulho & vihannekset",
          ingredients: [
            `${Math.round(170 * scale)}g kiinteää tofua marinoituna`,
            `${carbSourceGrams}g tummaa riisiä (kuivapaino)`,
            "150g parsakaalia ja porkkanaa",
            "1 rkl oliiviöljyä paistamiseen",
          ],
        },
        dinner: {
          name: "Linssi-kasviskastike & täysjyväpasta",
          ingredients: [
            `${Math.round(130 * scale)}g punaisia linssejä`,
            `${carbSourceGrams}g täysjyväpastaa`,
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
            `${Math.round(250 * scale)}g kreikkalaista jogurttia`,
            `${Math.round(45 * scale)}g täysjyvämysliä`,
            "100g vadelmia tai mansikoita",
            "1 rkl hunajaa",
          ],
        },
        lunch: {
          name: "Halloumi-kvinoasalaatti",
          ingredients: [
            `${Math.round(130 * scale)}g halloumijuustoa paistettuna`,
            `${carbSourceGrams}g kvinoaa (kuivapaino)`,
            "Tuorekurkkua, tomaattia ja salaattisekoitusta",
            "1 rkl oliiviöljy-sitruunakastiketta",
          ],
        },
        dinner: {
          name: "Pinaatti-fetapasta",
          ingredients: [
            `${carbSourceGrams}g täysjyväpastaa`,
            `${Math.round(90 * scale)}g fetajuustoa murusteltuna`,
            "100g tuoretta pinaattia",
            "Kirsikkatomaatteja ja valkosipulia",
          ],
        },
        snack: {
          name: "Raejuustoa & hedelmiä",
          ingredients: [
            `${Math.round(200 * scale)}g raejuustoa`,
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
            `${Math.round(3 * scale >= 3 ? 3 : 2)} paistettua kananmunaa`,
            `${Math.round(60 * scale)}g pekonia rapeaksi paistettuna`,
            "1 kokonainen avokado viipaloituna",
            "Kourallinen tuoretta pinaattia",
          ],
        },
        lunch: {
          name: "Kana-fetavuohenjuustosalaatti öljyllä",
          ingredients: [
            `${meatGrams}g broilerin rintafileetä`,
            `${Math.round(50 * scale)}g fetajuustoa tai vuohenjuustoa`,
            "Iso salaattipohja (salaattia, kurkkua)",
            "3 rkl laadukasta oliiviöljyä tai MCT-öljyä",
          ],
        },
        dinner: {
          name: "Rasvainen lohifilee & parsakaalia",
          ingredients: [
            `${fishGrams}g merilohta uunissa`,
            "150g parsakaalia voissa paistettuna",
            "Kastike: 50g ranskankermaa (crème fraîche) & tilliä",
          ],
        },
        snack: {
          name: "Avokado-rahkamousse tai pähkinät",
          ingredients: [
            `${Math.round(150 * scale)}g täysrasvaista rahkaa`,
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
            `${oatsGrams}g gluteenittomia kaurahiutaleita`,
            "30g heraproteiinia (tai 150g raejuustoa)",
            "100g marjoja",
            "15g siemeniä",
          ],
        },
        lunch: {
          name: "Kana-riisikulho & kasvikset",
          ingredients: [
            `${meatGrams}g broilerin rintafileetä`,
            `${carbSourceGrams}g riisiä tai kvinoaa`,
            "150g höyrytettyjä kasviksia",
            "10g oliiviöljyä",
          ],
        },
        dinner: {
          name: "Naudanliha-perunamuusi",
          ingredients: [
            `${meatGrams}g naudan paistijauhelihaa (10%)`,
            `${Math.round(250 * scale)}g perunoita muusiksi tehtynä`,
            "Tuoretta salaattia",
          ],
        },
        snack: {
          name: "Gluteeniton välipala",
          ingredients: [
            `${Math.round(250 * scale)}g maitorahkaa`,
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
          `${oatsGrams}g kaurahiutaleita`,
          "30g heraproteiinia (tai 150g raejuustoa)",
          "100g pakastemarjoja",
          "15g pähkinöitä / siemeniä",
        ],
      },
      lunch: {
        name: "Kana-riisikulho & kasvikset",
        ingredients: [
          `${meatGrams}g broilerin rintafileetä`,
          `${carbSourceGrams}g tummaa riisiä (kuivapaino)`,
          "150g höyrytettyjä kasviksia",
          "10g oliiviöljyä tai pähkinäöljyä",
        ],
      },
      dinner: {
        name: "Jauhelihakastike & perunat",
        ingredients: [
          `${meatGrams}g naudan jauhelihaa (10%)`,
          `${Math.round(250 * scale)}g kuorittuja perunoita`,
          "Runsaasti tuoresalaattia & kurkkua",
          "1 rkl salaatinkastiketta",
        ],
      },
      snack: {
        name: "Rahka / Raejuusto & ruisleipä",
        ingredients: [
          `${Math.round(250 * scale)}g rasvatonta maitorahkaa tai raejuustoa`,
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
    <main className={`${outfit.variable} font-sans min-h-screen bg-[#F4F5F7] text-slate-900 py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Otsikko */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A]">
            Makrolaskuri & Ruokavalio
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
            Laske henkilökohtaiset kalori- ja makrotavoitteesi sekä saa heti 1 päivän esimerkkiruokavalio sähköpostiisi.
          </p>
        </div>

        {/* Syöteosio */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-[#1E3A8A] border-b border-slate-100 pb-3">
            1. Syötä tietosi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sukupuoli */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sukupuoli
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#1E3A8A] transition"
              >
                <option value="male">Mies</option>
                <option value="female">Nainen</option>
              </select>
            </div>

            {/* Ikä */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ikä (v)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#1E3A8A] transition"
              />
            </div>

            {/* Pituus */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pituus (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#1E3A8A] transition"
              />
            </div>

            {/* Nykyinen paino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nykyinen paino (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#1E3A8A] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tavoitepaino */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tavoitepaino (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#1E3A8A] transition"
              />
            </div>

            {/* Aktiivisuustaso */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aktiivisuus
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-slate-
