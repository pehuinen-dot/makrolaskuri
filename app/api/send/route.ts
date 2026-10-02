import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, results, meals } = await req.json();

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY puuttuu ympäristömuuttujista." },
        { status: 500 }
      );
    }

    // Luodaan sähköpostin HTML-sisältö
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34d399; margin-bottom: 8px;">⚡ Henkilökohtainen Makroraporttisi</h1>
        <p style="color: #94a3b8; font-size: 14px;">Tässä on laskurimme muodostama yhteenveto ja 1 päivän ruokavalio.</p>
        
        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />

        <h3 style="color: #38bdf8; margin-bottom: 8px;">📊 Päivittäiset tavoitteesi</h3>
        <ul style="list-style: none; padding: 0; font-size: 15px;">
          <li style="margin-bottom: 6px;">🔥 <strong>Tavoitekalorit:</strong> ${results.targetCalories} kcal / pvä</li>
          <li style="margin-bottom: 6px;">🥩 <strong>Proteiini:</strong> ${results.proteinGrams} g</li>
          <li style="margin-bottom: 6px;">🥑 <strong>Rasva:</strong> ${results.fatGrams} g</li>
          <li style="margin-bottom: 6px;">🍚 <strong>Hiilihydraatti:</strong> ${results.carbGrams} g</li>
          <li style="margin-bottom: 6px;">🌾 <strong>Kuitu (minimi):</strong> ${results.fiberGrams} g</li>
        </ul>

        ${
          results.weeksToGoal > 0
            ? `
          <div style="background-color: #064e3b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #059669;">
            <h4 style="color: #34d399; margin: 0 0 6px 0;">📈 Painoennusteesi (${results.targetWeight} kg)</h4>
            <p style="margin: 0; font-size: 14px; color: #e2e8f0;">
              Saavutat tavoitteesi noin <strong>${results.weeksToGoal} viikossa</strong> (${results.targetDateStr} mennessä).
            </p>
          </div>
        `
            : ""
        }

        <h3 style="color: #34d399; margin-top: 24px; margin-bottom: 12px;">🥗 Ehdotus 1 päivän aterioista</h3>
        
        ${
          meals.breakfast
            ? `
          <div style="background-color: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <strong style="color: #fbbf24; text-transform: uppercase; font-size: 12px;">Aamupala</strong>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${meals.breakfast.name}</div>
            <ul style="font-size: 13px; color: #cbd5e1; margin-top: 6px; padding-left: 20px;">
              ${meals.breakfast.ingredients.map((i: string) => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        ${
          meals.lunch
            ? `
          <div style="background-color: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <strong style="color: #60a5fa; text-transform: uppercase; font-size: 12px;">Lounas</strong>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${meals.lunch.name}</div>
            <ul style="font-size: 13px; color: #cbd5e1; margin-top: 6px; padding-left: 20px;">
              ${meals.lunch.ingredients.map((i: string) => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        ${
          meals.dinner
            ? `
          <div style="background-color: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <strong style="color: #34d399; text-transform: uppercase; font-size: 12px;">Päivällinen</strong>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${meals.dinner.name}</div>
            <ul style="font-size: 13px; color: #cbd5e1; margin-top: 6px; padding-left: 20px;">
              ${meals.dinner.ingredients.map((i: string) => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        ${
          meals.snack
            ? `
          <div style="background-color: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <strong style="color: #c084fc; text-transform: uppercase; font-size: 12px;">Iltapala / Välipala</strong>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${meals.snack.name}</div>
            <ul style="font-size: 13px; color: #cbd5e1; margin-top: 6px; padding-left: 20px;">
              ${meals.snack.ingredients.map((i: string) => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0 16px 0;" />
        
        <p style="text-align: center; font-size: 12px; color: #64748b;">
          Tämän viestin lähetti Makrolaskuri. Tsemppiä tavoitteidesi saavuttamiseen! 🚀
        </p>
      </div>
    `;

    // Lähetetään sähköposti Resend API:n kautta
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Makrolaskuri <onboarding@resend.dev>",
        to: [email],
        subject: "⚡ Tässä on henkilökohtainen ruokavaliosi ja makrosi",
        html: htmlContent,
      }),
    });

    if (!resendRes.ok) {
      const errorData = await resendRes.json();
      console.error("Resend API error:", errorData);
      return NextResponse.json({ error: errorData }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
