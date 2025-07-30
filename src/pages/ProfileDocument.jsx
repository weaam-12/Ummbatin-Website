import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "../styles/img.png"; // تأكد من المسار الصحيح لشعار البلدية

// تعريف الأنماط
const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 40,
        fontFamily: "Helvetica"
    },
    header: {
        flexDirection: "row",
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
        marginBottom: 10
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
    }
});

const ProfileDocument = ({ document, profile, t }) => (
    <Document>
        <Page size="A4" style={styles.page}>
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

export default ProfileDocument;