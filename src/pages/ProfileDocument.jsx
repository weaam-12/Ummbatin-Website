// ProfileDocument.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "../components/styles/img.png";

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 40,
        fontFamily: "Helvetica"
    },
    header: {
        flexDirection: i18n => i18n.dir() === 'rtl' ? 'row-reverse' : 'row',
        justifyContent: "space-between",
        marginBottom: 20,
        alignItems: "center"
    },
    logo: {
        width: 100,
        height: 50
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20
    },
    section: {
        marginBottom: 10,
        textAlign: i18n => i18n.dir() === 'rtl' ? 'right' : 'left'
    },
    label: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 5
    },
    value: {
        fontSize: 12,
        marginBottom: 10
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: "center",
        fontSize: 10,
        color: "#666666"
    },
    // أنماط للنصوص العربية
    arabicText: {
        fontFamily: "Helvetica",
        writingMode: "rl-tb",
        textAlign: "right"
    }
});

// دالة مساعدة للتحقق إذا كان النص عربي
const isArabicText = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
};

const ProfileDocument = ({ document, profile, t, i18n }) => {
    // تحديد إذا كانت اللغة عربية
    const isRTL = i18n.language === 'ar';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header(isRTL)}>
                    <Image src={logo} style={styles.logo} />
                    <Text style={isRTL ? styles.arabicText : {}}>
                        {t("municipalityName")}
                    </Text>
                </View>

                <Text style={{...styles.title, ...(isRTL ? styles.arabicText : {})}}>
                    {document.name}
                </Text>

                <View style={styles.section(isRTL)}>
                    <Text style={{...styles.label, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.documentLabels.residentInfo")}:
                    </Text>
                    <Text style={{...styles.value, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.labels.fullName")}: {profile.fullName}
                    </Text>
                    <Text style={{...styles.value, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.labels.idNumber")}: {profile.idNumber}
                    </Text>
                </View>

                <View style={styles.section(isRTL)}>
                    <Text style={{...styles.label, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.documentLabels.documentDetails")}:
                    </Text>
                    <Text style={{...styles.value, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.labels.documentType")}: {document.name}
                    </Text>
                    <Text style={{...styles.value, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.labels.issueDate")}: {document.date}
                    </Text>
                    <Text style={{...styles.value, ...(isRTL ? styles.arabicText : {})}}>
                        {t("profile.labels.documentNumber")}: {document.id}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={isRTL ? styles.arabicText : {}}>
                        {t("profile.documentLabels.electronicDocument")}
                    </Text>
                    <Text style={isRTL ? styles.arabicText : {}}>
                        © {new Date().getFullYear()} {t("allRightsReserved")}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ProfileDocument;