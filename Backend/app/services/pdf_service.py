import io
from datetime import datetime, timezone
from typing import List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, Image, PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


# ─── Brand colors ───
BRAND_PRIMARY = colors.HexColor("#2563eb")     # blue
BRAND_DARK = colors.HexColor("#0f172a")        # dark slate
BRAND_LIGHT = colors.HexColor("#f1f5f9")       # light gray
BRAND_SUCCESS = colors.HexColor("#10b981")     # green
BRAND_MUTED = colors.HexColor("#64748b")       # gray


def _currency(amount: float) -> str:
    return f"₹{amount:,.2f}"


def _build_header(story, title: str, subtitle: str = ""):
    """Add brand header to PDF."""
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "BrandTitle", parent=styles["Title"],
        fontSize=26, textColor=BRAND_PRIMARY,
        spaceAfter=4, alignment=TA_LEFT, fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "BrandSub", parent=styles["Normal"],
        fontSize=10, textColor=BRAND_MUTED,
        spaceAfter=20,
    )
    company_style = ParagraphStyle(
        "Company", parent=styles["Normal"],
        fontSize=9, textColor=BRAND_MUTED, alignment=TA_RIGHT,
    )

    # Header table — company info on right, title on left
    header_data = [
        [
            Paragraph("<b>Jairao EngineerSolutions</b><br/>"
                      "GST: 27ABCDE1234F1Z5<br/>"
                      "Mumbai, Maharashtra, India<br/>"
                      "support@jairao.com | +91 98765 43210", company_style),
        ],
    ]
    header_table = Table(header_data, colWidths=[170 * mm])
    header_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(header_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph(title, title_style))
    if subtitle:
        story.append(Paragraph(subtitle, subtitle_style))
    else:
        story.append(Spacer(1, 15))


def _build_footer(story):
    """Add footer line with page number placeholder."""
    story.append(Spacer(1, 30))
    styles = getSampleStyleSheet()
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontSize=8, textColor=BRAND_MUTED, alignment=TA_CENTER,
    )
    story.append(Paragraph(
        "Thank you for choosing Jairao EngineerSolutions.<br/>"
        "This is a computer-generated document. No signature required.",
        footer_style,
    ))


# ═══════════════════════════════════════════════════
# 1. ORDER INVOICE PDF
# ═══════════════════════════════════════════════════
def generate_order_invoice(
    order_number: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    address: str,
    items: List[dict],           # [{"name": ..., "qty": ..., "unit_price": ..., "total": ...}]
    subtotal: float,
    discount: float,
    total: float,
    order_date: datetime,
    payment_method: str = "Cash on Delivery",
    status: str = "PENDING",
) -> bytes:
    """Generate a professional invoice PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=f"Invoice {order_number}", author="Jairao EngineerSolutions",
    )
    story = []
    styles = getSampleStyleSheet()

    # Header
    _build_header(
        story,
        "TAX INVOICE",
        f"Invoice #: <b>{order_number}</b>  |  "
        f"Date: {order_date.strftime('%d %b %Y')}  |  "
        f"Status: {status}",
    )

    # Customer info box
    info_style = ParagraphStyle(
        "Info", parent=styles["Normal"],
        fontSize=10, textColor=BRAND_DARK, leading=14,
    )
    info_data = [
        [
            Paragraph(f"""
                <b>Bill To:</b><br/>
                {customer_name}<br/>
                {customer_email}<br/>
                {customer_phone or ''}<br/>
                {address}
            """, info_style),
            Paragraph(f"""
                <b>Payment Method:</b> {payment_method}<br/>
                <b>Order Number:</b> {order_number}<br/>
                <b>Order Date:</b> {order_date.strftime('%d %b %Y, %I:%M %p')}
            """, info_style),
        ]
    ]
    info_table = Table(info_data, colWidths=[90 * mm, 80 * mm])
    info_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, BRAND_MUTED),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # Items table
    item_header = ["#", "Product", "Qty", "Unit Price", "Total"]
    rows = [item_header]
    for i, item in enumerate(items, 1):
        rows.append([
            str(i),
            item["name"],
            str(item["qty"]),
            _currency(item["unit_price"]),
            _currency(item["total"]),
        ])

    items_table = Table(rows, colWidths=[10 * mm, 90 * mm, 15 * mm, 30 * mm, 25 * mm])
    items_table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        # Body
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.3, BRAND_MUTED),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 15))

    # Totals
    totals_rows = [
        ["", "Subtotal:", _currency(subtotal)],
        ["", "Discount:", f"-{_currency(discount)}"],
        ["", "Total Amount:", _currency(total)],
    ]
    totals_table = Table(totals_rows, colWidths=[120 * mm, 30 * mm, 20 * mm])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (1, 2), (-1, 2), "Helvetica-Bold"),
        ("FONTSIZE", (1, 2), (-1, 2), 12),
        ("TEXTCOLOR", (1, 2), (-1, 2), BRAND_SUCCESS),
        ("LINEABOVE", (1, 2), (-1, 2), 1, BRAND_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(totals_table)

    _build_footer(story)
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# ═══════════════════════════════════════════════════
# 2. SOLAR QUOTATION PDF
# ═══════════════════════════════════════════════════
def generate_solar_quotation(
    quote_number: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    location: str,
    system_capacity_kw: float,
    panel_type: str,
    inverter_type: str,
    battery_included: bool,
    panel_cost: float,
    inverter_cost: float,
    battery_cost: float,
    installation_cost: float,
    subsidy: float,
    total_cost: float,
    valid_until: datetime,
    quote_date: datetime,
) -> bytes:
    """Generate a solar system quotation PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=f"Solar Quotation {quote_number}", author="Jairao EngineerSolutions",
    )
    story = []
    styles = getSampleStyleSheet()

    _build_header(
        story,
        "SOLAR QUOTATION",
        f"Quote #: <b>{quote_number}</b>  |  "
        f"Date: {quote_date.strftime('%d %b %Y')}  |  "
        f"Valid Until: {valid_until.strftime('%d %b %Y')}",
    )

    # Customer + system info
    info_style = ParagraphStyle("Info", parent=styles["Normal"], fontSize=10, leading=14)
    info_data = [
        [
            Paragraph(f"""
                <b>Customer Details:</b><br/>
                {customer_name}<br/>
                {customer_email}<br/>
                {customer_phone}<br/>
                <b>Location:</b> {location}
            """, info_style),
            Paragraph(f"""
                <b>System Details:</b><br/>
                <b>Capacity:</b> {system_capacity_kw} kW<br/>
                <b>Panel Type:</b> {panel_type}<br/>
                <b>Inverter:</b> {inverter_type}<br/>
                <b>Battery:</b> {'Yes' if battery_included else 'No'}
            """, info_style),
        ]
    ]
    info_table = Table(info_data, colWidths=[90 * mm, 80 * mm])
    info_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, BRAND_MUTED),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # Cost breakdown
    story.append(Paragraph(
        "<b>Cost Breakdown</b>",
        ParagraphStyle("H2", parent=styles["Heading2"], textColor=BRAND_PRIMARY),
    ))
    story.append(Spacer(1, 8))

    rows = [["Component", "Cost"]]
    rows.append(["Solar Panels", _currency(panel_cost)])
    rows.append(["Inverter", _currency(inverter_cost)])
    if battery_included:
        rows.append(["Battery", _currency(battery_cost)])
    rows.append(["Installation & Wiring", _currency(installation_cost)])

    subtotal = panel_cost + inverter_cost + (battery_cost if battery_included else 0) + installation_cost

    cost_table = Table(rows, colWidths=[130 * mm, 40 * mm])
    cost_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.3, BRAND_MUTED),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(cost_table)
    story.append(Spacer(1, 12))

    # Totals with subsidy
    totals_rows = [
        ["", "Subtotal:", _currency(subtotal)],
        ["", "Government Subsidy:", f"-{_currency(subsidy)}"],
        ["", "Total Cost:", _currency(total_cost)],
    ]
    totals_table = Table(totals_rows, colWidths=[120 * mm, 30 * mm, 20 * mm])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (1, 2), (-1, 2), "Helvetica-Bold"),
        ("FONTSIZE", (1, 2), (-1, 2), 12),
        ("TEXTCOLOR", (1, 2), (-1, 2), BRAND_SUCCESS),
        ("LINEABOVE", (1, 2), (-1, 2), 1, BRAND_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(totals_table)

    # Terms
    story.append(Spacer(1, 25))
    story.append(Paragraph(
        "<b>Terms & Conditions:</b>",
        ParagraphStyle("Terms", parent=styles["Heading3"], textColor=BRAND_DARK),
    ))
    terms_style = ParagraphStyle("TermItem", parent=styles["Normal"], fontSize=9, leading=13)
    story.append(Paragraph(
        "• This quotation is valid for 15 days from the date of issue.<br/>"
        "• 50% advance payment required to confirm the order.<br/>"
        "• Installation within 15 working days from order confirmation.<br/>"
        "• Government subsidy subject to applicable rules and approval.<br/>"
        "• Warranty: Panels - 25 years, Inverter - 5 years, Installation - 1 year.",
        terms_style,
    ))

    _build_footer(story)
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# ═══════════════════════════════════════════════════
# 3. GENERAL INQUIRY QUOTATION PDF
# ═══════════════════════════════════════════════════
def generate_inquiry_quotation(
    quote_number: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    subject: str,
    description: str,
    items: List[dict],             # [{"description": ..., "qty": ..., "rate": ..., "amount": ...}]
    subtotal: float,
    tax: float,
    total: float,
    valid_until: datetime,
    quote_date: datetime,
    notes: Optional[str] = None,
) -> bytes:
    """Generate a general service/product inquiry quotation PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=f"Quotation {quote_number}", author="Jairao EngineerSolutions",
    )
    story = []
    styles = getSampleStyleSheet()

    _build_header(
        story,
        "QUOTATION",
        f"Quote #: <b>{quote_number}</b>  |  "
        f"Date: {quote_date.strftime('%d %b %Y')}  |  "
        f"Valid Until: {valid_until.strftime('%d %b %Y')}",
    )

    # Customer info
    info_style = ParagraphStyle("Info", parent=styles["Normal"], fontSize=10, leading=14)
    info_data = [
        [
            Paragraph(f"""
                <b>To:</b><br/>
                {customer_name}<br/>
                {customer_email}<br/>
                {customer_phone}
            """, info_style),
            Paragraph(f"""
                <b>Subject:</b> {subject}<br/>
                <b>Reference:</b> {quote_number}<br/>
                <b>Date:</b> {quote_date.strftime('%d %b %Y')}
            """, info_style),
        ]
    ]
    info_table = Table(info_data, colWidths=[90 * mm, 80 * mm])
    info_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, BRAND_MUTED),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 18))

    # Description
    if description:
        story.append(Paragraph(
            "<b>Requirement Summary:</b>",
            ParagraphStyle("Req", parent=styles["Normal"], fontSize=10, textColor=BRAND_DARK),
        ))
        story.append(Paragraph(description, ParagraphStyle(
            "Desc", parent=styles["Normal"], fontSize=10, leading=14,
        )))
        story.append(Spacer(1, 15))

    # Items table
    story.append(Paragraph(
        "<b>Proposed Items & Services</b>",
        ParagraphStyle("H2", parent=styles["Heading2"], textColor=BRAND_PRIMARY),
    ))
    story.append(Spacer(1, 8))

    rows = [["#", "Description", "Qty", "Rate", "Amount"]]
    for i, item in enumerate(items, 1):
        rows.append([
            str(i),
            item["description"],
            str(item["qty"]),
            _currency(item["rate"]),
            _currency(item["amount"]),
        ])

    items_table = Table(rows, colWidths=[10 * mm, 90 * mm, 15 * mm, 30 * mm, 25 * mm])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.3, BRAND_MUTED),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 12))

    # Totals
    totals_rows = [
        ["", "Subtotal:", _currency(subtotal)],
        ["", f"Tax (18%):", _currency(tax)],
        ["", "Grand Total:", _currency(total)],
    ]
    totals_table = Table(totals_rows, colWidths=[120 * mm, 30 * mm, 20 * mm])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (1, 2), (-1, 2), "Helvetica-Bold"),
        ("FONTSIZE", (1, 2), (-1, 2), 12),
        ("TEXTCOLOR", (1, 2), (-1, 2), BRAND_SUCCESS),
        ("LINEABOVE", (1, 2), (-1, 2), 1, BRAND_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(totals_table)

    # Notes
    if notes:
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            "<b>Notes:</b>",
            ParagraphStyle("N", parent=styles["Normal"], fontSize=10, textColor=BRAND_DARK),
        ))
        story.append(Paragraph(notes, ParagraphStyle(
            "NoteItem", parent=styles["Normal"], fontSize=9, leading=13,
        )))

    _build_footer(story)
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()