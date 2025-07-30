import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";
import logo from "../components/styles/img.png";
import { useTranslation } from "react-i18next";

// تسجيل الخطوط
Font.register({
    family: 'Arabic',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/ea/notokufiarabic/v6/NotoKufiArabic-Regular.ttf',
        },
        {
            src: 'https://fonts.gstatic.com/ea/notokufiarabic/v6/NotoKufiArabic-Bold.ttf',
            fontWeight: 'bold'
        }
    ]
});

Font.register({
    family: 'Hebrew',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/opensanshebrew/v34/ALpRZlxJ1gN2eJa6AehQ5E9zdYPv9w.ttf',
        },
        {
            src: 'https://fonts.gstatic.com/s/opensanshebrew/v34/ALpRZlxJ1gN2eJa6AehQ5E9zdYPv9w.ttf',
            fontWeight: 'bold'
        }
    ]
});

const ProfileDocument = ({ document, profile, t, i18n }) => {
    // إنشاء الأنماط داخل المكون لاستخدام i18n
    const styles = StyleSheet.create({
        page: {
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            padding: 40,
            fontFamily: i18n.language === 'ar' ? 'Arabic' : 'Hebrew'
        },
        header: {
            flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row',
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
            marginVertical: 20,
            fontFamily: i18n.language === 'ar' ? 'Arabic' : 'Hebrew'
        },
        section: {
            marginBottom: 10,
            textAlign: i18n.language === 'ar' ? 'right' : 'left'
        },
        label: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
            fontFamily: i18n.language === 'ar' ? 'Arabic' : 'Hebrew'
        },
        value: {
            fontSize: 12,
            marginBottom: 10,
            fontFamily: i18n.language === 'ar' ? 'Arabic' : 'Hebrew'
        },
        footer: {
            position: "absolute",
            bottom: 40,
            left: 40,
            right: 40,
            textAlign: "center",
            fontSize: 10,
            color: "#666666",
            fontFamily: i18n.language === 'ar' ? 'Arabic' : 'Hebrew'
        }
    });

    const isRTL = i18n.language === 'ar';

    return (
        <Document>
            <Page
                size="A4"
                style={styles.page}
                wrap
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <View style={styles.header}>
                    <Image src={logo} style={styles.logo} />
                    <Text>{t("municipalityName")}</Text>
                </View>

                <Text style={styles.title}>{document.name}</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>{t("profile.documentLabels.residentInfo")}:</Text>
                    <Text style={styles.value}>{t("profile.labels.fullName")}: {profile.fullName}</Text>
                    <Text style={styles.value}>{t("profile.labels.idNumber")}: {profile.idNumber}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>{t("profile.documentLabels.documentDetails")}:</Text>
                    <Text style={styles.value}>{t("profile.labels.documentType")}: {document.name}</Text>
                    <Text style={styles.value}>{t("profile.labels.issueDate")}: {document.date}</Text>
                    <Text style={styles.value}>{t("profile.labels.documentNumber")}: {document.id}</Text>
                </View>

                <View style={styles.footer}>
                    <Text>{t("profile.documentLabels.electronicDocument")}</Text>
                    <Text>© {new Date().getFullYear()} {t("allRightsReserved")}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ProfileDocument;