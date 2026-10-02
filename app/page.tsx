'use client';

import React, { useState } from 'react';

export default function Home() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('38');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('90');
  const [activity, setActivity] = useState('1.725');
  const [goal, setGoal] = useState('-500');
  const [diet, setDiet] = useState('omnivore');

  const [result, setResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const a = parseFloat(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    const act = parseFloat(activity) || 1.2;
    const g = parseFloat(goal) || 0;

    if (!a || !h || !w) return;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const tdee = bmr * act;
    const targetCalories = Math.round(tdee + g);

    let protein = Math.round(w * 2);
    let fat = Math.round(w * 1);

    if (diet === 'keto') {
      fat = Math.round((targetCalories * 0.7) / 9);
      protein = Math.round((targetCalories * 0.25) / 4);
    }

    const carbCalories = Math.max(0, targetCalories - (protein * 4 + fat * 9));
    const carbs = Math.round(carbCalories / 4);
    const fiber = Math.max(25, Math.round((targetCalories / 1000) * 14));

    setResult({
      calories: targetCalories,
      protein,
      carbs,
      fat,
      fiber,
      diet,
      weight,
      goalText: goal === '-500' ? 'Rasvanpoltto' : goal === '300' ? 'Lihaskasvu' : 'Painon ylläpito'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getDetailedMeals = () => {
    if (!result) return [];
    const { protein, carbs } = result;

    const pRatio = protein / 180;
    const cRatio = carbs / 200;

    const oatsGrams = Math.round(60 * cRatio);
    const wheyGrams = 30;
    const berriesGrams = 100;
    const pähkinäGrams = 15;

    const chickenGrams = Math.round(160 * pRatio);
    const riceGrams = Math.round(70 * cRatio);
    const vegGrams = 150;

    const curdGrams = 200;
    const appleGrams = 150;

    const beefGrams = Math.round(160 * pRatio);
    const potatoGrams = Math.round(250 * cRatio);
    const oilGrams = 10;

    return [
      {
        name: 'Aamupala',
        items: [
          { ingredient: `Kaurapuuro (${oatsGrams}g raaka)`, p: Math.round(oatsGrams * 0.13), c: Math.round(oatsGrams * 0.6), f: Math.round(oatsGrams * 0.07), fiber: Math.round(oatsGrams * 0.1) },
          { ingredient: `Hera-/kasviproteiini (${wheyGrams}g)`, p: 24, c: 2, f: 2, fiber: 0 },
          { ingredient: `Marjat (${berriesGrams}g)`, p: 1, c: 10, f: 0, fiber: 3 },
          { ingredient: `Pähkinät (${pähkinäGrams}g)`, p: 3, c: 2, f: 9, fiber: 2 }
        ]
      },
      {
        name: 'Lounas',
        items: [
          { ingredient: `Kananrinta/Kala (${chickenGrams}g kypsä)`, p: Math.round(chickenGrams * 0.28), c: 0, f: Math.round(chickenGrams * 0.03), fiber: 0 },
          { ingredient: `Riisi (${riceGrams}g raaka)`, p: Math.round(riceGrams * 0.07), c: Math.round(riceGrams * 0.78), f: 1, fiber: Math.round(riceGrams * 0.02) },
          { ingredient: `Tuoresalaatti & vihannekset (${vegGrams}g)`, p: 2, c: 6, f: 0, fiber: 4 }
        ]
      },
      {
        name: 'Välipala',
        items: [
          { ingredient: `Maitorahka / Raejuusto (${curdGrams}g)`, p: 22, c: 8, f: 1, fiber: 0 },
          { ingredient: `Omena (${appleGrams}g)`, p: 0, c: 18, f: 0, fiber: 3 },
          { ingredient: 'Chiansiemenet / Kuitujauhe (10g)', p: 2, c: 1, f: 3, fiber: 4 }
        ]
      },
      {
        name: 'Illallinen',
        items: [
          { ingredient: `Jauheliha 10% / Kala (${beefGrams}g kypsä)`, p: Math.round(beefGrams * 0.26), c: 0, f: Math.round(beefGrams * 0.1), fiber: 0 },
          { ingredient: `Peruna (${potatoGrams}g kuorittu)`, p: Math.round(potatoGrams * 0.02), c: Math.round(potatoGrams * 0.17), f: 0, fiber: Math.round(potatoGrams * 0.018) },
          { ingredient: `Oliiviöljy paistamiseen (${oilGrams}g)`, p: 0, c: 0, f: 10, fiber: 0 },
          { ingredient: 'Värikäs uunilohi/uunikasvikset (150g)', p: 2, c: 8, f: 1, fiber: 4 }
        ]
      }
    ];
  };

  const detailedMeals = getDetailedMeals();

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* TULOSTATUSASETUKSET (TIIVIS A4 & 2 SIVUA) */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
          .print-wrapper {
            background-color: #ffffff !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 2px solid #0f172a !important;
            padding-bottom: 8px !important;
            margin-bottom: 12px !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }
          .print-card {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 8px !important;
            text-align: center !important;
          }
          .print-meal-card {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
            padding: 10px !important;
          }
          .print-meal-card * {
            color: #0f172a !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          
          /* PAKOTETAAN SIVU 2 OMALLE SIVULLEEN TIIVIISTI */
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 10px !important;
          }

          .print-section {
            page-break-inside: avoid !important;
          }

          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 4px !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            padding: 5px 8px !important;
            text-align: left !important;
            border-bottom: 2px solid #cbd5e1 !important;
            font-size: 0.8rem !important;
          }
          .print-table td {
            padding: 5px 8px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            color: #334155 !important;
            font-size: 0.8rem !important;
          }
          .print-table tfoot td {
            background-color: #f8fafc !important;
            border-top: 2px solid #0f172a !important;
            font-weight: bold !important;
            color: #0f172a !important;
          }
          .print-footer {
            display: block !important;
            margin-top: 16px !important;
            padding-top: 8px !important;
            border-top: 1px solid #cbd5e1 !important;
            font-size: 0.75rem !important;
            color: #64748b !important;
            text-align: center !important;
          }
        }
      `}</style>

      <div className="print-wrapper" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', maxWidth: '650px', width: '100%' }}>
        
        {/* SIVU 1: OTSIKKO */}
        <div className="print-header" style={{ display: 'none' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a' }}>⚡ MAKRO- JA RAVINTORAPORTTI</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Henkilökohtainen ravitsemussuunnitelma (Sivu 1/2)</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
            Päiväys: {new Date().toLocaleDateString('fi-FI')}<br />
            Tavoite: {result?.goalText}
          </div>
        </div>

        {/* LOMAKE (Piilotetaan tulostettaessa) */}
        <div className="no-print">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>⚡ Makrolaskuri</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Syötä tietosi ja laske henkilökohtaiset makrosi & ruokavaliosi.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#cbd5e1' }}>Sukupuoli</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: gender === 'male' ? '#10b981' : '#0f172a', color: gender === 'male' ? '#000' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Mies
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: gender === 'female' ? '#10b981' : '#0f172a', color: gender === 'female' ? '#000' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Nainen
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>Ikä</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>Pituus (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>Paino (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#cbd5e1' }}>Ruokavalio</label>
              <select value={diet} onChange={(e) => setDiet(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="omnivore">Sekasyöjä (Kaikki käy)</option>
                <option value="vegetarian">Kasvisruokavalio (Lakto-ovo)</option>
                <option value="vegan">Vegaani (Täysin kasvispohjainen)</option>
                <option value="keto">Ketogeeninen (Erittäin vähähiilihydraattinen)</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#cbd5e1' }}>Aktiivisuustaso</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="1.2">Kevyt (Istumatyö, ei treeniä)</option>
                <option value="1.375">Kohtalainen (Treeni 1-3 krt/vko)</option>
                <option value="1.55">Aktiivinen (Treeni 3-5 krt/vko)</option>
                <option value="1.725">Erittäin aktiivinen (Raskas treeni 6-7 krt/vko)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#cbd5e1' }}>Tavoite</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="-500">Rasvanpoltto (-500 kcal)</option>
                <option value="0">Painon ylläpito</option>
                <option value="300">Lihaskasvu (+300 kcal)</option>
              </select>
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#000', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Laske makrot
            </button>
          </form>
        </div>

        {/* TULOKSET & RAPORTTI */}
        {result && (
          <div>
            {/* SIVU 1 OSAPUOLI */}
            <div className="print-section" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="print-text-dark" style={{ margin: 0, fontSize: '1.1rem', color: '#10b981' }}>Päivittäinen tavoite:</h3>
                <button className="no-print" onClick={handlePrint} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  🖨️ Tulosta / Tallenna PDF (2 sivua)
                </button>
              </div>

              <div className="print-text-dark" style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '16px' }}>
                {result.calories} <span style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#94a3b8' }}>kcal / pv</span>
              </div>

              {/* Makroruudukko */}
              <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center', marginBottom: '20px' }}>
                <div className="print-card" style={{ backgroundColor: '#0f172a', padding: '10px 4px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Proteiini</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>{result.protein}g</div>
                </div>
                <div className="print-card" style={{ backgroundColor: '#0f172a', padding: '10px 4px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hiilihydraatti</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15', marginTop: '2px' }}>{result.carbs}g</div>
                </div>
                <div className="print-card" style={{ backgroundColor: '#0f172a', padding: '10px 4px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Rasva</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f43f5e', marginTop: '2px' }}>{result.fat}g</div>
                </div>
                <div className="print-card" style={{ backgroundColor: '#0f172a', padding: '12px 6px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Kuidut</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7', marginTop: '2px' }}>{result.fiber}g</div>
                </div>
              </div>

              {/* Yhteenveto aterioista */}
              <div style={{ marginTop: '16px' }}>
                <h4 className="print-text-dark" style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#10b981' }}>
                  Ateriarakenne ja esimerkit ({result.calories} kcal)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {detailedMeals.map((m, idx) => (
                    <div key={idx} className="print-meal-card" style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981', marginBottom: '2px' }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {m.items.map(i => i.ingredient).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIVU 2: TARKKA ERITTELY RAAKA-AINEITTAIN & ATERIATO TAALIT */}
            <div className="page-break print-section">
              
              <div className="print-header" style={{ display: 'none' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a' }}>⚡ MAKRO- JA RAVINTORAPORTTI</h1>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Aterioiden ravintoaine-erittely (Sivu 2/2)</p>
                </div>
              </div>

              <h3 className="print-text-dark" style={{ fontSize: '1.1rem', color: '#10b981', marginBottom: '12px', marginTop: 0 }}>
                📊 Mistä makrot & kuidut kertyvät? (Ateriakohtainen erittely)
              </h3>

              {detailedMeals.map((meal, mIdx) => {
                // Lasketaan aterian kokonaissummat (Totaalit)
                const totP = meal.items.reduce((sum, item) => sum + item.p, 0);
                const totC = meal.items.reduce((sum, item) => sum + item.c, 0);
                const totF = meal.items.reduce((sum, item) => sum + item.f, 0);
                const totFiber = meal.items.reduce((sum, item) => sum + item.fiber, 0);

                return (
                  <div key={mIdx} style={{ marginBottom: '14px' }}>
                    <h4 className="print-text-dark" style={{ margin: '0 0 4px 0', color: '#38bdf8', fontSize: '0.9rem' }}>
                      {meal.name}
                    </h4>
                    <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e293b', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <th style={{ padding: '6px 10px' }}>Raaka-aine</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center' }}>Prot (g)</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center' }}>Hh (g)</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center' }}>Rasva (g)</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center' }}>Kuitu (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meal.items.map((item, iIdx) => (
                          <tr key={iIdx} style={{ borderBottom: '1px solid #334155', fontSize: '0.8rem', color: '#e2e8f0' }}>
                            <td style={{ padding: '5px 10px' }}>{item.ingredient}</td>
                            <td style={{ padding: '5px 10px', textAlign: 'center', color: '#38bdf8' }}>{item.p}</td>
                            <td style={{ padding: '5px 10px', textAlign: 'center', color: '#facc15' }}>{item.c}</td>
                            <td style={{ padding: '5px 10px', textAlign: 'center', color: '#f43f5e' }}>{item.f}</td>
                            <td style={{ padding: '5px 10px', textAlign: 'center', color: '#a855f7' }}>{item.fiber}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#1e293b', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          <td style={{ padding: '6px 10px', color: '#10b981' }}>YHTEENSÄ ({meal.name})</td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#38bdf8' }}>{totP}g</td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#facc15' }}>{totC}g</td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#f43f5e' }}>{totF}g</td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#a855f7' }}>{totFiber}g</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}

              <div className="print-footer" style={{ display: 'none' }}>
                Tämä raportti on generoitu automaattisesti. Arvot ovat suuntaa-antavia arvioita laadukkaista ravinnonlähteistä.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}