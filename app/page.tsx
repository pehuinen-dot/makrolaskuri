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
          name: "Kana-riisikulho & kas
