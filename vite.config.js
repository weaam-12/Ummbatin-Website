// ProfileDocument.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";

// تسجيل الخط (يجب تثبيت الخط أولاً أو استيراده)
Font.register({
  family: 'Noto Sans Arabic',
  src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrGZM2i5uSS85Mawrt3gn0e5Qh6dHhXcmt0ErG3yp4.woff2'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Noto Sans Arabic"
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

const ProfileDocument = ({ document, profile, t, i18n }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
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