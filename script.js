
function calculateDose() {
  const inr = parseFloat(document.getElementById("inr").value);
  const weeklyDose = parseFloat(document.getElementById("weeklyDose").value);
  const hasBleeding = document.getElementById("hasBleeding").checked;
  const mode = document.getElementById("mode").value;
  const manualPercent = parseInt(document.getElementById("manualPercent").value);
  const startDay = parseInt(document.getElementById("startDay").value);

  let percentChange = 0;
  let advice = "";

  if (mode === "manual") {
    percentChange = manualPercent;
    advice = `ปรับขนาดยา ${percentChange > 0 ? "+" : ""}${percentChange}% ตามที่เลือก`;
  } else {
    if (hasBleeding) {
      advice = "หยุดยาและให้ Vitamin K พิจารณาส่งโรงพยาบาล";
      showResult(advice, 0, startDay);
      return;
    }
    if (inr < 1.5) { percentChange = 20; advice = "เพิ่มขนาดยา 10–20%"; }
    else if (inr < 2) { percentChange = 10; advice = "เพิ่มขนาดยาเล็กน้อย"; }
    else if (inr <= 3) { percentChange = 0; advice = "คงขนาดยาเดิม"; }
    else if (inr <= 3.5) { percentChange = -10; advice = "ลดขนาดยาเล็กน้อย"; }
    else if (inr <= 4) { percentChange = -15; advice = "ลดขนาดยา 10–15%"; }
    else { percentChange = -20; advice = "หยุดยา 1 วัน และลดขนาดยา 15–20%"; }
  }

  const newWeekly = Math.round(weeklyDose * (1 + percentChange / 100));
  showResult(advice, newWeekly, startDay);
}

function showResult(advice, totalMg, startDay) {
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  let html = `<div class='box'><strong>คำแนะนำ:</strong> ${advice}</div>`;
  html += `<div><strong>ขนาดยาใหม่:</strong> ${totalMg} mg/สัปดาห์</div>`;
  const daily = distributeDose(totalMg);

  html += "<div class='day-grid'>";
  for (let i = 0; i < 7; i++) {
    const dayIndex = (startDay + i) % 7;
    const mg = daily[i];
    const pillText = mg === 0 ? "หยุดยา" : `${mg} mg`;
    const pillCount = Math.round(mg / 0.5);
    const doseText = mg === 0 ? "" : `(${pillCount / 2} เม็ด)`;
    html += `<div class='day-card'><strong>${dayNames[dayIndex]}</strong><br>${pillText}<br>${doseText}<br>${renderPills(mg)}</div>`;
  }
  html += "</div>";
  html += `<div style="margin-top:10px;"><strong>รวม:</strong> ${daily.reduce((a,b) => a+b, 0)} mg</div>`;
  document.getElementById("result").innerHTML = html;
}

function distributeDose(total) {
  const daily = Array(7).fill(0);
  const unit = 0.5;
  const maxDays = 7;
  for (let dose = 6; dose >= unit; dose -= unit) {
    for (let days = maxDays; days >= 1; days--) {
      if (Math.abs(dose * days - total) < 0.01) {
        for (let i = 0; i < days; i++) daily[i] = dose;
        return daily;
      }
    }
  }
  for (let i = 0; i < 7; i++) {
    daily[i] = Math.round((total / 7) * 2) / 2;
  }
  let diff = total - daily.reduce((a,b) => a+b, 0);
  for (let i = 0; diff !== 0 && i < 7; i++) {
    if (diff > 0.25) { daily[i] += 0.5; diff -= 0.5; }
    else if (diff < -0.25) { daily[i] -= 0.5; diff += 0.5; }
    else break;
  }
  return daily;
}

// Toggle theme
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.createElement("button");
  toggle.id = "themeToggle";
  toggle.innerText = "🌓 เปลี่ยนธีม";
  toggle.onclick = () => document.body.classList.toggle("dark");
  document.body.prepend(toggle);
});
