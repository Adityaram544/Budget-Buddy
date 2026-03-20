/**
 * Budget Buddy – PDF Export Module
 * Clean, professional, perfectly aligned expense report
 */

window.generatePDFReport = function(expenses, user, summaryTotals) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── Colour Palette ──────────────────────────────────────────────────────
  const C = {
    violet:     [76,  29,  149],
    violetMid:  [109, 40,  217],
    violetPale: [237, 233, 254],
    teal:       [13,  148, 136],
    tealPale:   [204, 251, 241],
    gold:       [180, 83,  9  ],
    goldPale:   [254, 243, 199],
    red:        [185, 28,  28 ],
    redPale:    [254, 226, 226],
    ink:        [15,  23,  42 ],
    slate:      [71,  85,  105],
    mist:       [148, 163, 184],
    white:      [255, 255, 255],
    offwhite:   [248, 250, 252],
    rule:       [226, 232, 240],
    lavender:   [196, 181, 253],
  };

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now   = new Date();
  const ML    = 12;
  const MR    = 12;
  const CW    = pageW - ML - MR;

  // ── Currency formatter — uses Rs. instead of ₹ so jsPDF renders it cleanly
  function fmtAmt(amount) {
    const num = Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return 'Rs. ' + num;
  }

  // ── Section title helper ────────────────────────────────────────────────
  function sectionTitle(title, yPos) {
    doc.setFillColor(...C.violet);
    doc.rect(ML, yPos - 4, 3, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C.violet);
    doc.text(title, ML + 6, yPos);
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.3);
    doc.line(ML, yPos + 2, pageW - MR, yPos + 2);
    return yPos + 9;
  }

  // ════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════
  doc.setFillColor(...C.offwhite);
  doc.rect(0, 0, pageW, pageH, 'F');

  doc.setFillColor(...C.violet);
  doc.rect(0, 0, pageW, 48, 'F');

  doc.setFillColor(...C.teal);
  doc.rect(0, 0, 5, 48, 'F');

  // App name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.white);
  doc.text('Budget Buddy', ML + 4, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.lavender);
  doc.text('Personal Expense Report', ML + 4, 26);

  // Thin rule inside header
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  doc.line(ML + 4, 30, pageW - MR, 30);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Date + period
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.lavender);
  doc.text('Generated: ' + now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), ML + 4, 37);

  const months = [...new Set(expenses.map(e => {
    const d = new Date(e.date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }))].sort();
  if (months.length > 0) {
    const first = new Date(months[0] + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const last  = new Date(months[months.length - 1] + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    doc.text('Period: ' + first + (first !== last ? '  to  ' + last : ''), ML + 4, 43);
  }

  // User info — right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.white);
  doc.text(user.displayName || 'User', pageW - MR, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.lavender);
  doc.text(user.email || '', pageW - MR, 26, { align: 'right' });
  doc.text(summaryTotals.count + ' transactions total', pageW - MR, 34, { align: 'right' });

  let y = 58;

  // ════════════════════════════════════════════════════
  // SUMMARY CARDS
  // ════════════════════════════════════════════════════
  y = sectionTitle('Summary Overview', y);

  const cardData = [
    { label: 'Total Expenses', value: fmtAmt(summaryTotals.total),     bg: C.violetPale, accent: C.violet },
    { label: 'This Month',     value: fmtAmt(summaryTotals.thisMonth),  bg: C.tealPale,   accent: C.teal   },
    { label: 'This Year',      value: fmtAmt(summaryTotals.thisYear),   bg: C.goldPale,   accent: C.gold   },
    { label: 'Transactions',   value: String(summaryTotals.count),      bg: C.redPale,    accent: C.red    },
  ];

  const cardW = (CW - 9) / 4;
  const cardH = 22;

  cardData.forEach((card, i) => {
    const cx = ML + i * (cardW + 3);

    doc.setFillColor(...card.bg);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');

    doc.setFillColor(...card.accent);
    doc.roundedRect(cx, y, cardW, 3, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.slate);
    doc.text(card.label.toUpperCase(), cx + 3.5, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(card.value.length > 12 ? 7.5 : 9);
    doc.setTextColor(...card.accent);
    doc.text(card.value, cx + 3.5, y + 17);
  });

  y += cardH + 10;

  // ════════════════════════════════════════════════════
  // SPENDING BY CATEGORY — horizontal bar chart
  // ════════════════════════════════════════════════════
  y = sectionTitle('Spending by Category', y);

  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const catList = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const catMax  = catList[0]?.[1] || 1;

  const BAR_H   = 5.5;
  const BAR_GAP = 5;
  const LBL_W   = 38;
  const AMT_W   = 30;
  const BAR_W   = CW - LBL_W - AMT_W - 6;
  const BCOLS   = [C.violet, C.teal, [8,145,178], [5,150,105], C.gold, C.red];

  catList.forEach(([cat, total], i) => {
    const cy     = y + i * (BAR_H + BAR_GAP);
    const barLen = Math.max((total / catMax) * BAR_W, 1);
    const pct    = ((total / (summaryTotals.total || 1)) * 100).toFixed(1);

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.ink);
    const lbl = cat.length > 16 ? cat.slice(0, 15) + '.' : cat;
    doc.text(lbl, ML, cy + BAR_H - 0.5);

    // Track
    doc.setFillColor(...C.rule);
    doc.roundedRect(ML + LBL_W, cy, BAR_W, BAR_H, 1, 1, 'F');

    // Fill
    doc.setFillColor(...BCOLS[i % BCOLS.length]);
    doc.roundedRect(ML + LBL_W, cy, barLen, BAR_H, 1, 1, 'F');

    // Pct inside or beside bar
    if (barLen > 12) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...C.white);
      doc.text(pct + '%', ML + LBL_W + 3, cy + BAR_H - 1);
    }

    // Amount — right aligned in its column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...BCOLS[i % BCOLS.length]);
    doc.text(fmtAmt(total), pageW - MR, cy + BAR_H - 0.5, { align: 'right' });
  });

  y += catList.length * (BAR_H + BAR_GAP) + 10;

  // ════════════════════════════════════════════════════
  // MONTHLY BREAKDOWN TABLE
  // ════════════════════════════════════════════════════
  if (expenses.length > 0) {
    y = sectionTitle('Monthly Breakdown', y);

    const byMonth = {};
    expenses.forEach(exp => {
      const d   = new Date(exp.date);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      byMonth[key] = (byMonth[key] || 0) + exp.amount;
    });

    const monthRows = Object.entries(byMonth)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([key, total]) => {
        const [yr, mo] = key.split('-');
        const txCount  = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === +yr && d.getMonth() + 1 === +mo;
        }).length;
        const label = new Date(+yr, +mo - 1)
          .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return [label, String(txCount) + ' txn', fmtAmt(total)];
      });

    doc.autoTable({
      startY: y,
      head: [['Month', 'Transactions', 'Total Spent']],
      body: monthRows,
      theme: 'plain',
      styles: {
        overflow: 'linebreak',
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineColor: C.rule,
        lineWidth: 0.25,
        fontSize: 8,
      },
      headStyles: {
        fillColor: C.violet,
        textColor: C.white,
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      },
      bodyStyles: {
        textColor: C.ink,
        fillColor: C.white,
      },
      alternateRowStyles: { fillColor: C.violetPale },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 40, halign: 'center', textColor: C.slate },
        2: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: C.teal },
      },
      margin: { left: ML, right: MR },
      tableWidth: CW,
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════
  // EXPENSE DETAILS TABLE
  // ════════════════════════════════════════════════════
  y = sectionTitle('Expense Details', y);

  // Fixed column widths that sum exactly to CW (186mm for A4 with 12mm margins each side)
  // CW = 210 - 12 - 12 = 186
  // #(8) + Title(46) + Category(34) + Date(26) + Amount(32) + Notes(40) = 186
  const tableRows = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((exp, i) => [
      String(i + 1),
      exp.title.length > 24 ? exp.title.slice(0, 23) + '.' : exp.title,
      exp.category,
      new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      fmtAmt(exp.amount),
      exp.notes ? (exp.notes.length > 20 ? exp.notes.slice(0, 19) + '.' : exp.notes) : '-',
    ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Title', 'Category', 'Date', 'Amount', 'Notes']],
    body: tableRows,
    theme: 'plain',
    styles: {
      overflow: 'linebreak',
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: C.rule,
      lineWidth: 0.2,
      fontSize: 7.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: C.ink,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      valign: 'middle',
    },
    bodyStyles: {
      textColor: C.ink,
      fillColor: C.white,
    },
    alternateRowStyles: { fillColor: C.offwhite },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center', textColor: C.mist,  fontStyle: 'normal' },
      1: { cellWidth: 46, textColor: C.ink,  fontStyle: 'normal' },
      2: { cellWidth: 34, textColor: C.slate },
      3: { cellWidth: 26, halign: 'center', textColor: C.slate },
      4: { cellWidth: 32, halign: 'right',  fontStyle: 'bold',   textColor: C.red },
      5: { cellWidth: 40, textColor: C.slate },
    },
    tableWidth: CW,
    margin: { left: ML, right: MR },
    // Compact header on continuation pages
    didDrawPage(data) {
      if (data.pageNumber > 1) {
        doc.setFillColor(...C.violet);
        doc.rect(0, 0, pageW, 7, 'F');
        doc.setFillColor(...C.teal);
        doc.rect(0, 0, 5, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C.white);
        doc.text('Budget Buddy  -  Expense Details (continued)', ML + 4, 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.lavender);
        doc.text(user.displayName || '', pageW - MR, 5, { align: 'right' });
      }
    },
  });

  // ── Grand Total bar ────────────────────────────────────────────────────────
  const afterTable = doc.lastAutoTable.finalY;
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  doc.setFillColor(...C.violet);
  doc.roundedRect(ML, afterTable + 3, CW, 9, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text('Grand Total', ML + 4, afterTable + 8.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.lavender);
  doc.text(summaryTotals.count + ' transactions', pageW / 2, afterTable + 8.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text(fmtAmt(grandTotal), pageW - MR - 3, afterTable + 8.8, { align: 'right' });

  // ── Footer on every page ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const ph = doc.internal.pageSize.getHeight();

    // Footer background — clean light bar
    doc.setFillColor(...C.violetPale);
    doc.rect(0, ph - 10, pageW, 10, 'F');

    // Left accent
    doc.setFillColor(...C.violet);
    doc.rect(0, ph - 10, 4, 10, 'F');

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate);
    doc.text('Budget Buddy  -  Personal Expense Report', ML + 2, ph - 4);

    // Page number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.violet);
    doc.text('Page ' + p + ' of ' + totalPages, pageW - MR, ph - 4, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = 'BudgetBuddy_Report_' + now.toISOString().slice(0, 10) + '.pdf';
  doc.save(filename);
};

function formatCurrencyPDF(amount) {
  return 'Rs. ' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}