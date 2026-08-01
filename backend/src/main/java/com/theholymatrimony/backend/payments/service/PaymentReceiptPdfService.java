package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import java.awt.Color;
import org.openpdf.text.Document;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PaymentReceiptPdfService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generateReceipt(
            PaymentReceiptResponse receipt
    ) {
        if (receipt == null) {
            throw new IllegalArgumentException(
                    "Payment receipt data is required."
            );
        }

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document(
                PageSize.A4,
                45,
                45,
                45,
                45
        );

        try {
            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.addTitle(
                    "Payment Receipt - " +
                            safe(receipt.getInvoiceNumber())
            );

            document.addAuthor(
                    "Holy Matrimony Services Private Limited"
            );

            document.addSubject(
                    "Membership payment receipt"
            );

            document.open();

            addCompanyHeader(document, receipt);
            addReceiptTitle(document);
            addInvoiceInformation(document, receipt);
            addMemberInformation(document, receipt);
            addPaymentInformation(document, receipt);
            addTotalSection(document, receipt);
            addFooter(document, receipt);

            document.close();

            return outputStream.toByteArray();
        } catch (Exception exception) {
            if (document.isOpen()) {
                document.close();
            }

            throw new IllegalStateException(
                    "Unable to generate the payment receipt PDF.",
                    exception
            );
        }
    }

    private void addCompanyHeader(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font companyFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                18,
                Color.DARK_GRAY
        );

        Font addressFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                9,
                Color.GRAY
        );

        Paragraph companyName = new Paragraph(
                safe(receipt.getCompanyName()),
                companyFont
        );

        companyName.setAlignment(Element.ALIGN_CENTER);
        companyName.setSpacingAfter(6);

        document.add(companyName);

        Paragraph companyAddress = new Paragraph(
                safe(receipt.getCompanyAddress()),
                addressFont
        );

        companyAddress.setAlignment(Element.ALIGN_CENTER);
        companyAddress.setSpacingAfter(3);

        document.add(companyAddress);

        Paragraph gstin = new Paragraph(
                "GSTIN: " + safe(receipt.getCompanyGstin()),
                addressFont
        );

        gstin.setAlignment(Element.ALIGN_CENTER);
        gstin.setSpacingAfter(18);

        document.add(gstin);
    }

    private void addReceiptTitle(
            Document document
    ) throws Exception {

        Font titleFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                20,
                Color.BLACK
        );

        Paragraph title = new Paragraph(
                "PAYMENT RECEIPT",
                titleFont
        );

        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(18);

        document.add(title);
    }

    private void addInvoiceInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        PdfPTable table = createTwoColumnTable();

        addLabelValueRow(
                table,
                "Invoice Number",
                receipt.getInvoiceNumber()
        );

        addLabelValueRow(
                table,
                "Receipt Date",
                formatDate(
                        receipt.getPaidAt() != null
                                ? receipt.getPaidAt()
                                : receipt.getCreatedAt()
                )
        );

        addLabelValueRow(
                table,
                "Payment Status",
                "PAID"
        );

        table.setSpacingAfter(18);
        document.add(table);
    }

    private void addMemberInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        document.add(sectionHeading("Member Details"));

        PdfPTable table = createTwoColumnTable();

        addLabelValueRow(
                table,
                "Member Name",
                receipt.getMemberName()
        );

        addLabelValueRow(
                table,
                "Email",
                receipt.getEmail()
        );

        addLabelValueRow(
                table,
                "Phone",
                receipt.getPhone()
        );

        table.setSpacingAfter(18);
        document.add(table);
    }

    private void addPaymentInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        document.add(sectionHeading("Payment Details"));

        PdfPTable table = createTwoColumnTable();

        addLabelValueRow(
                table,
                "Membership Plan",
                formatEnumValue(receipt.getPlan())
        );

        addLabelValueRow(
                table,
                "Billing Cycle",
                formatEnumValue(receipt.getBillingCycle())
        );

        addLabelValueRow(
                table,
                "Currency",
                receipt.getCurrency()
        );

        addLabelValueRow(
                table,
                "Razorpay Order ID",
                receipt.getRazorpayOrderId()
        );

        addLabelValueRow(
                table,
                "Razorpay Payment ID",
                receipt.getRazorpayPaymentId()
        );

        table.setSpacingAfter(18);
        document.add(table);
    }

    private void addTotalSection(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font labelFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                13,
                Color.WHITE
        );

        Font amountFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                15,
                Color.WHITE
        );

        PdfPTable totalTable = new PdfPTable(
                new float[]{2.5f, 1.5f}
        );

        totalTable.setWidthPercentage(100);

        PdfPCell labelCell = new PdfPCell(
                new Phrase(
                        "Total Amount Paid",
                        labelFont
                )
        );

        labelCell.setPadding(12);
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setBackgroundColor(
                new Color(45, 55, 72)
        );

        PdfPCell amountCell = new PdfPCell(
                new Phrase(
                        formatAmount(receipt),
                        amountFont
                )
        );

        amountCell.setPadding(12);
        amountCell.setHorizontalAlignment(
                Element.ALIGN_RIGHT
        );
        amountCell.setBorder(PdfPCell.NO_BORDER);
        amountCell.setBackgroundColor(
                new Color(45, 55, 72)
        );

        totalTable.addCell(labelCell);
        totalTable.addCell(amountCell);

        totalTable.setSpacingAfter(24);
        document.add(totalTable);
    }

    private void addFooter(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font thankYouFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                11,
                Color.DARK_GRAY
        );

        Font footerFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                9,
                Color.GRAY
        );

        Paragraph thankYou = new Paragraph(
                "Thank you for choosing Holy Matrimony.",
                thankYouFont
        );

        thankYou.setAlignment(Element.ALIGN_CENTER);
        thankYou.setSpacingAfter(8);

        document.add(thankYou);

        Paragraph note = new Paragraph(
                "This is a computer-generated payment receipt " +
                        "and does not require a signature.",
                footerFont
        );

        note.setAlignment(Element.ALIGN_CENTER);
        note.setSpacingAfter(5);

        document.add(note);

        Paragraph reference = new Paragraph(
                "Receipt Reference: " +
                        safe(receipt.getInvoiceNumber()),
                footerFont
        );

        reference.setAlignment(Element.ALIGN_CENTER);

        document.add(reference);
    }

    private Paragraph sectionHeading(
            String text
    ) {
        Font sectionFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                12,
                Color.DARK_GRAY
        );

        Paragraph heading = new Paragraph(
                text,
                sectionFont
        );

        heading.setSpacingAfter(8);

        return heading;
    }

    private PdfPTable createTwoColumnTable()
            throws Exception {

        PdfPTable table = new PdfPTable(
                new float[]{1.4f, 2.6f}
        );

        table.setWidthPercentage(100);

        return table;
    }

    private void addLabelValueRow(
            PdfPTable table,
            String label,
            String value
    ) {

        Font labelFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                10,
                Color.DARK_GRAY
        );

        Font valueFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                10,
                Color.BLACK
        );

        PdfPCell labelCell = new PdfPCell(
                new Phrase(label, labelFont)
        );

        labelCell.setPadding(9);
        labelCell.setBackgroundColor(
                new Color(245, 245, 245)
        );
        labelCell.setBorderColor(
                new Color(220, 220, 220)
        );

        PdfPCell valueCell = new PdfPCell(
                new Phrase(safe(value), valueFont)
        );

        valueCell.setPadding(9);
        valueCell.setBorderColor(
                new Color(220, 220, 220)
        );

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String formatAmount(
            PaymentReceiptResponse receipt
    ) {
        BigDecimal amount =
                receipt.getAmountInRupees() == null
                        ? BigDecimal.ZERO
                        : receipt.getAmountInRupees();

        String currency =
                safe(receipt.getCurrency());

        return currency + " " +
                amount.setScale(
                        2,
                        java.math.RoundingMode.HALF_UP
                ).toPlainString();
    }

    private String formatDate(
            LocalDateTime dateTime
    ) {
        if (dateTime == null) {
            return "-";
        }

        return dateTime.format(
                DATE_TIME_FORMATTER
        );
    }

    private String formatEnumValue(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return "-";
        }

        String lowerCase =
                value.trim()
                        .replace('_', ' ')
                        .toLowerCase();

        return Character.toUpperCase(
                lowerCase.charAt(0)
        ) + lowerCase.substring(1);
    }

    private String safe(
            String value
    ) {
        return value == null || value.isBlank()
                ? "-"
                : value.trim();
    }
}