package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;

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

import java.awt.Color;
import java.io.ByteArrayOutputStream;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.Locale;

@Service
public class PaymentReceiptPdfService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd MMM yyyy, hh:mm a"
            );

    private static final Color NAVY =
            new Color(
                    11,
                    45,
                    92
            );

    private static final Color GOLD =
            new Color(
                    212,
                    175,
                    55
            );

    private static final Color DARK_TEXT =
            new Color(
                    31,
                    41,
                    55
            );

    private static final Color MUTED_TEXT =
            new Color(
                    100,
                    116,
                    139
            );

    private static final Color LIGHT_BACKGROUND =
            new Color(
                    248,
                    250,
                    252
            );

    private static final Color BORDER =
            new Color(
                    226,
                    232,
                    240
            );

    /*
     * ============================================================
     * GENERATE RECEIPT
     * ============================================================
     */

    public byte[] generateReceipt(
            PaymentReceiptResponse receipt
    ) {

        if (
                receipt == null
        ) {
            throw new IllegalArgumentException(
                    "Payment receipt data is required."
            );
        }

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document =
                new Document(
                        PageSize.A4,
                        45,
                        45,
                        40,
                        40
                );

        try {

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.addTitle(
                    "Membership Receipt - " +
                            safe(
                                    receipt.getInvoiceNumber()
                            )
            );

            document.addAuthor(
                    safe(
                            receipt.getCompanyName()
                    )
            );

            document.addSubject(
                    "Holy Matrimony membership transaction receipt"
            );

            document.open();

            addCompanyHeader(
                    document,
                    receipt
            );

            addReceiptTitle(
                    document,
                    receipt
            );

            addReceiptInformation(
                    document,
                    receipt
            );

            addMemberInformation(
                    document,
                    receipt
            );

            addMembershipInformation(
                    document,
                    receipt
            );

            addAmountSection(
                    document,
                    receipt
            );

            addFooter(
                    document,
                    receipt
            );

            document.close();

            return outputStream.toByteArray();

        } catch (
                Exception exception
        ) {

            if (
                    document.isOpen()
            ) {
                document.close();
            }

            throw new IllegalStateException(
                    "Unable to generate the membership receipt PDF.",
                    exception
            );
        }
    }

    /*
     * ============================================================
     * COMPACT COMPANY HEADER
     * ============================================================
     */

    private void addCompanyHeader(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font companyFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        17,
                        NAVY
                );

        Font locationFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        9,
                        MUTED_TEXT
                );

        Font detailsFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        8.5f,
                        DARK_TEXT
                );

        Paragraph company =
                new Paragraph(
                        safe(
                                receipt.getCompanyName()
                        ),
                        companyFont
                );

        company.setAlignment(
                Element.ALIGN_CENTER
        );

        company.setSpacingAfter(
                4
        );

        document.add(
                company
        );

        Paragraph location =
                new Paragraph(
                        safe(
                                receipt.getCompanyAddress()
                        ),
                        locationFont
                );

        location.setAlignment(
                Element.ALIGN_CENTER
        );

        location.setSpacingAfter(
                5
        );

        document.add(
                location
        );

        /*
         * GST + Contact details in one compact line.
         */

        StringBuilder companyDetails =
                new StringBuilder();

        if (
                hasText(
                        receipt.getCompanyGstin()
                )
        ) {
            companyDetails
                    .append(
                            "GSTIN: "
                    )
                    .append(
                            receipt
                                    .getCompanyGstin()
                                    .trim()
                    );
        }

        if (
                hasText(
                        receipt.getCompanyEmail()
                )
        ) {

            if (
                    !companyDetails.isEmpty()
            ) {
                companyDetails.append(
                        "   |   "
                );
            }

            companyDetails
                    .append(
                            "Contact: "
                    )
                    .append(
                            receipt
                                    .getCompanyEmail()
                                    .trim()
                    );
        }

        Paragraph details =
                new Paragraph(
                        companyDetails.toString(),
                        detailsFont
                );

        details.setAlignment(
                Element.ALIGN_CENTER
        );

        details.setSpacingAfter(
                3
        );

        document.add(
                details
        );

        if (
                hasText(
                        receipt.getCompanyWebsite()
                )
        ) {

            Paragraph website =
                    new Paragraph(
                            "Website: " +
                                    receipt
                                            .getCompanyWebsite()
                                            .trim(),
                            locationFont
                    );

            website.setAlignment(
                    Element.ALIGN_CENTER
            );

            website.setSpacingAfter(
                    12
            );

            document.add(
                    website
            );
        }

        /*
         * Gold brand separator.
         */

        PdfPTable separator =
                new PdfPTable(
                        1
                );

        separator.setWidthPercentage(
                100
        );

        PdfPCell separatorCell =
                new PdfPCell(
                        new Phrase("")
                );

        separatorCell.setFixedHeight(
                3
        );

        separatorCell.setBorder(
                PdfPCell.NO_BORDER
        );

        separatorCell.setBackgroundColor(
                GOLD
        );

        separator.addCell(
                separatorCell
        );

        separator.setSpacingAfter(
                14
        );

        document.add(
                separator
        );
    }

    /*
     * ============================================================
     * RECEIPT TITLE
     * ============================================================
     */

    private void addReceiptTitle(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font titleFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        18,
                        NAVY
                );

        Font subtitleFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        9,
                        MUTED_TEXT
                );

        Paragraph title =
                new Paragraph(
                        "MEMBERSHIP RECEIPT",
                        titleFont
                );

        title.setAlignment(
                Element.ALIGN_CENTER
        );

        title.setSpacingAfter(
                4
        );

        document.add(
                title
        );

        String subtitleText;

        if (
                isCouponTransaction(
                        receipt
                )
        ) {
            subtitleText =
                    "Membership activated using coupon " +
                            safe(
                                    receipt.getCouponCode()
                            );
        } else {
            subtitleText =
                    "Membership payment processed via " +
                            formatEnumValue(
                                    receipt.getPaymentSource()
                            );
        }

        Paragraph subtitle =
                new Paragraph(
                        subtitleText,
                        subtitleFont
                );

        subtitle.setAlignment(
                Element.ALIGN_CENTER
        );

        subtitle.setSpacingAfter(
                14
        );

        document.add(
                subtitle
        );
    }

    /*
     * ============================================================
     * RECEIPT INFORMATION
     * ============================================================
     */

    private void addReceiptInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        PdfPTable table =
                createTwoColumnTable();

        addLabelValueRow(
                table,
                "Receipt Number",
                receipt.getInvoiceNumber()
        );

        LocalDateTime receiptDate =
                receipt.getPaidAt() != null
                        ? receipt.getPaidAt()
                        : receipt.getCreatedAt();

        addLabelValueRow(
                table,
                "Receipt Date",
                formatDate(
                        receiptDate
                )
        );

        addLabelValueRow(
                table,
                "Transaction Status",
                formatEnumValue(
                        receipt.getStatus()
                )
        );

        if (
                receipt.getPaymentRecordId()
                        != null
        ) {
            addLabelValueRow(
                    table,
                    "Transaction Reference",
                    receipt
                            .getPaymentRecordId()
                            .toString()
            );
        }

        table.setSpacingAfter(
                14
        );

        document.add(
                table
        );
    }

    /*
     * ============================================================
     * MEMBER INFORMATION
     * ============================================================
     */

    private void addMemberInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        document.add(
                sectionHeading(
                        "Member Details"
                )
        );

        PdfPTable table =
                createTwoColumnTable();

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

        if (
                hasText(
                        receipt.getPhone()
                )
        ) {
            addLabelValueRow(
                    table,
                    "Phone",
                    receipt.getPhone()
            );
        }

        table.setSpacingAfter(
                14
        );

        document.add(
                table
        );
    }

    /*
     * ============================================================
     * MEMBERSHIP / PAYMENT INFORMATION
     * ============================================================
     */

    private void addMembershipInformation(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        document.add(
                sectionHeading(
                        "Membership Details"
                )
        );

        PdfPTable table =
                createTwoColumnTable();

        addLabelValueRow(
                table,
                "Membership Plan",
                formatEnumValue(
                        receipt.getPlan()
                )
        );

        addLabelValueRow(
                table,
                "Billing Cycle",
                formatEnumValue(
                        receipt.getBillingCycle()
                )
        );

        addLabelValueRow(
                table,
                "Payment Source",
                formatEnumValue(
                        receipt.getPaymentSource()
                )
        );

        if (
                hasText(
                        receipt.getPaymentMethod()
                )
        ) {
            addLabelValueRow(
                    table,
                    "Payment Method",
                    formatEnumValue(
                            receipt.getPaymentMethod()
                    )
            );
        }

        if (
                hasText(
                        receipt.getCouponCode()
                )
        ) {
            addLabelValueRow(
                    table,
                    "Coupon Code",
                    receipt.getCouponCode()
            );
        }

        addLabelValueRow(
                table,
                "Currency",
                receipt.getCurrency()
        );

        /*
         * Only online payments show Razorpay identifiers.
         * Coupon receipts stay clean.
         */

        if (
                hasText(
                        receipt.getRazorpayOrderId()
                )
        ) {
            addLabelValueRow(
                    table,
                    "Razorpay Order ID",
                    receipt.getRazorpayOrderId()
            );
        }

        if (
                hasText(
                        receipt.getRazorpayPaymentId()
                )
        ) {
            addLabelValueRow(
                    table,
                    "Razorpay Payment ID",
                    receipt.getRazorpayPaymentId()
            );
        }

        table.setSpacingAfter(
                14
        );

        document.add(
                table
        );
    }

    /*
     * ============================================================
     * AMOUNT
     * ============================================================
     */

    private void addAmountSection(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font labelFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        12,
                        Color.WHITE
                );

        Font amountFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        15,
                        Color.WHITE
                );

        PdfPTable totalTable =
                new PdfPTable(
                        new float[]{
                                2.5f,
                                1.5f
                        }
                );

        totalTable.setWidthPercentage(
                100
        );

        String amountLabel =
                isCouponTransaction(
                        receipt
                )
                        ? "Amount Paid (Coupon Waiver)"
                        : "Amount Paid";

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(
                                amountLabel,
                                labelFont
                        )
                );

        labelCell.setPadding(
                11
        );

        labelCell.setBorder(
                PdfPCell.NO_BORDER
        );

        labelCell.setBackgroundColor(
                NAVY
        );

        PdfPCell amountCell =
                new PdfPCell(
                        new Phrase(
                                formatAmount(
                                        receipt
                                ),
                                amountFont
                        )
                );

        amountCell.setPadding(
                11
        );

        amountCell.setHorizontalAlignment(
                Element.ALIGN_RIGHT
        );

        amountCell.setBorder(
                PdfPCell.NO_BORDER
        );

        amountCell.setBackgroundColor(
                NAVY
        );

        totalTable.addCell(
                labelCell
        );

        totalTable.addCell(
                amountCell
        );

        totalTable.setSpacingAfter(
                10
        );

        document.add(
                totalTable
        );

        if (
                isCouponTransaction(
                        receipt
                )
        ) {

            Font noteFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            8.5f,
                            new Color(
                                    146,
                                    100,
                                    0
                            )
                    );

            Paragraph couponNote =
                    new Paragraph(
                            "The membership fee was fully waived using coupon " +
                                    safe(
                                            receipt.getCouponCode()
                                    ) +
                                    ". No monetary payment was collected for this transaction.",
                            noteFont
                    );

            couponNote.setSpacingAfter(
                    15
            );

            document.add(
                    couponNote
            );
        }
    }

    /*
     * ============================================================
     * FOOTER
     * ============================================================
     */

    private void addFooter(
            Document document,
            PaymentReceiptResponse receipt
    ) throws Exception {

        Font thankYouFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        10,
                        DARK_TEXT
                );

        Font footerFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        8,
                        MUTED_TEXT
                );

        Paragraph thankYou =
                new Paragraph(
                        "Thank you for choosing Holy Matrimony.",
                        thankYouFont
                );

        thankYou.setAlignment(
                Element.ALIGN_CENTER
        );

        thankYou.setSpacingBefore(
                6
        );

        thankYou.setSpacingAfter(
                6
        );

        document.add(
                thankYou
        );

        Paragraph note =
                new Paragraph(
                        "This is a computer-generated membership receipt and does not require a signature.",
                        footerFont
                );

        note.setAlignment(
                Element.ALIGN_CENTER
        );

        note.setSpacingAfter(
                4
        );

        document.add(
                note
        );

        Paragraph reference =
                new Paragraph(
                        "Receipt Reference: " +
                                safe(
                                        receipt.getInvoiceNumber()
                                ),
                        footerFont
                );

        reference.setAlignment(
                Element.ALIGN_CENTER
        );

        document.add(
                reference
        );
    }

    /*
     * ============================================================
     * SECTION HEADING
     * ============================================================
     */

    private Paragraph sectionHeading(
            String text
    ) {

        Font sectionFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        11,
                        NAVY
                );

        Paragraph heading =
                new Paragraph(
                        text,
                        sectionFont
                );

        heading.setSpacingAfter(
                7
        );

        return heading;
    }

    /*
     * ============================================================
     * TABLE
     * ============================================================
     */

    private PdfPTable createTwoColumnTable() {

        PdfPTable table =
                new PdfPTable(
                        new float[]{
                                1.4f,
                                2.6f
                        }
                );

        table.setWidthPercentage(
                100
        );

        return table;
    }

    /*
     * ============================================================
     * TABLE ROW
     * ============================================================
     */

    private void addLabelValueRow(
            PdfPTable table,
            String label,
            String value
    ) {

        Font labelFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        9,
                        DARK_TEXT
                );

        Font valueFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        9,
                        Color.BLACK
                );

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(
                                label,
                                labelFont
                        )
                );

        labelCell.setPadding(
                8
        );

        labelCell.setBackgroundColor(
                LIGHT_BACKGROUND
        );

        labelCell.setBorderColor(
                BORDER
        );

        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(
                                safe(
                                        value
                                ),
                                valueFont
                        )
                );

        valueCell.setPadding(
                8
        );

        valueCell.setBorderColor(
                BORDER
        );

        table.addCell(
                labelCell
        );

        table.addCell(
                valueCell
        );
    }

    /*
     * ============================================================
     * AMOUNT FORMAT
     * ============================================================
     */

    private String formatAmount(
            PaymentReceiptResponse receipt
    ) {

        BigDecimal amount =
                receipt.getAmountInRupees() == null
                        ? BigDecimal.ZERO
                        : receipt.getAmountInRupees();

        String currency =
                hasText(
                        receipt.getCurrency()
                )
                        ? receipt
                                .getCurrency()
                                .trim()
                                .toUpperCase(
                                        Locale.ROOT
                                )
                        : "INR";

        return currency +
                " " +
                amount
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                        .toPlainString();
    }

    /*
     * ============================================================
     * DATE
     * ============================================================
     */

    private String formatDate(
            LocalDateTime dateTime
    ) {

        if (
                dateTime == null
        ) {
            return "-";
        }

        return dateTime.format(
                DATE_TIME_FORMATTER
        );
    }

    /*
     * ============================================================
     * ENUM DISPLAY
     * ============================================================
     */

    private String formatEnumValue(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return "-";
        }

        String normalized =
                value
                        .trim()
                        .replace(
                                '_',
                                ' '
                        )
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (
                normalized.isBlank()
        ) {
            return "-";
        }

        return Character
                .toUpperCase(
                        normalized.charAt(
                                0
                        )
                ) +
                normalized.substring(
                        1
                );
    }

    /*
     * ============================================================
     * COUPON TRANSACTION
     * ============================================================
     */

    private boolean isCouponTransaction(
            PaymentReceiptResponse receipt
    ) {

        if (
                receipt == null
        ) {
            return false;
        }

        if (
                hasText(
                        receipt.getPaymentSource()
                ) &&
                receipt
                        .getPaymentSource()
                        .equalsIgnoreCase(
                                "COUPON"
                        )
        ) {
            return true;
        }

        return hasText(
                receipt.getCouponCode()
        );
    }

    /*
     * ============================================================
     * TEXT HELPERS
     * ============================================================
     */

    private boolean hasText(
            String value
    ) {

        return value != null &&
                !value.isBlank();
    }

    private String safe(
            String value
    ) {

        return hasText(
                value
        )
                ? value.trim()
                : "-";
    }
}
