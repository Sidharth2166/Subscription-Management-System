import os
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import settings
from app.models import Invoice

def generate_invoice_pdf(invoice: Invoice) -> str:
    os.makedirs(settings.PDF_STORAGE_DIR, exist_ok=True)
    pdf_filename = f"{invoice.invoice_number.replace('/', '_')}.pdf"
    pdf_path = os.path.join(settings.PDF_STORAGE_DIR, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0A3B1B'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#5F6E63'),
        spaceAfter=14
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#122017'),
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#333333'),
        spaceAfter=2
    )

    elements = []

    # Header Row
    header_data = [
        [
            Paragraph("<b>SUBFLOW TECHNOLOGIES INC.</b><br/>402 Cyber City, DLF Phase 2<br/>Gurugram, Haryana 122002<br/>GSTIN: 07AAAAA0000A1Z5", body_style),
            Paragraph(f"<b>TAX INVOICE</b><br/>Invoice #: <b>{invoice.invoice_number}</b><br/>Date: {invoice.issue_date.strftime('%d %b %Y')}<br/>Due Date: {invoice.due_date.strftime('%d %b %Y')}<br/>Status: <b>{invoice.status.upper()}</b>", body_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[270, 270])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 12))

    # Billed To
    cust = invoice.customer
    bill_to_data = [
        [
            Paragraph("<b>BILLED TO:</b>", h2_style),
            Paragraph("<b>BILLING PERIOD:</b>", h2_style)
        ],
        [
            Paragraph(f"<b>{cust.company_name}</b><br/>Attn: {cust.name}<br/>{cust.address or 'Commercial Towers'}<br/>{cust.city or 'Bengaluru'}, {cust.state or 'Karnataka'} {cust.postal_code or '560001'}<br/>GSTIN: {cust.gstin or '29AAAAA1111B1Z2'}", body_style),
            Paragraph(f"Cycle: <b>{invoice.billing_period}</b><br/>Subscription #: {invoice.subscription.subscription_number if invoice.subscription else 'Direct'}", body_style)
        ]
    ]
    bill_table = Table(bill_to_data, colWidths=[270, 270])
    bill_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEBELOW', (0, 1), (-1, 1), 1, colors.HexColor('#DDDDDD')),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
    ]))
    elements.append(bill_table)
    elements.append(Spacer(1, 16))

    # Line Items
    items_data = [
        [
            Paragraph("<b>Item Description</b>", body_style),
            Paragraph("<b>Qty</b>", body_style),
            Paragraph("<b>Unit Price (₹)</b>", body_style),
            Paragraph("<b>Total (₹)</b>", body_style)
        ]
    ]

    for line in invoice.lines:
        items_data.append([
            Paragraph(line.description, body_style),
            Paragraph(str(line.quantity), body_style),
            Paragraph(f"₹{line.unit_price:,.2f}", body_style),
            Paragraph(f"₹{line.total_price:,.2f}", body_style)
        ])

    items_table = Table(items_data, colWidths=[280, 50, 100, 110])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F7F3')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 14))

    # Summary Totals
    summary_data = [
        [Paragraph("Subtotal:", body_style), Paragraph(f"₹{invoice.subtotal:,.2f}", body_style)],
        [Paragraph("Discount:", body_style), Paragraph(f"-₹{invoice.discount_amount:,.2f}", body_style)],
        [Paragraph("GST (18%):", body_style), Paragraph(f"+₹{invoice.tax_amount:,.2f}", body_style)],
        [Paragraph("<b>TOTAL DUE:</b>", h2_style), Paragraph(f"<b>₹{invoice.total_amount:,.2f}</b>", h2_style)],
        [Paragraph("Amount Paid:", body_style), Paragraph(f"₹{invoice.amount_paid:,.2f}", body_style)],
        [Paragraph("<b>BALANCE OUTSTANDING:</b>", h2_style), Paragraph(f"<b>₹{invoice.amount_due:,.2f}</b>", h2_style)],
    ]
    summary_table = Table(summary_data, colWidths=[430, 110])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEABOVE', (0, 3), (-1, 3), 1, colors.HexColor('#12C94B')),
        ('LINEABOVE', (0, 5), (-1, 5), 1, colors.HexColor('#000000')),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 24))

    # Footer Notes
    elements.append(Paragraph("<b>Payment Instructions:</b>", h2_style))
    elements.append(Paragraph("Direct UPI: subflow@hdfcbank | NEFT/RTGS: SubFlow Inc, HDFC Bank, A/C 50200088991122, IFSC: HDFC0000123", body_style))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Thank you for choosing SubFlow. Manage subscriptions. Protect revenue. Grow smarter.", subtitle_style))

    doc.build(elements)
    invoice.pdf_path = pdf_path
    return pdf_path
