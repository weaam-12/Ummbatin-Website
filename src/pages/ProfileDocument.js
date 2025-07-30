import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "./styles/img.png"; // شعار البلدية

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

const ProfileDocument = ({ document, profile }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Image src={logo} style={styles.logo} />
                <Text>بلدية أم بطين</Text>
            </View>

            <Text style={styles.title}>{document.name}</Text>

            <View style={styles.section}>
                <Text style={styles.label}>معلومات المواطن:</Text>
                <Text style={styles.value}>الاسم: {profile.fullName}</Text>
                <Text style={styles.value}>رقم الهوية: {profile.idNumber}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>تفاصيل الوثيقة:</Text>
                <Text style={styles.value}>نوع الوثيقة: {document.name}</Text>
                <Text style={styles.value}>تاريخ الإصدار: {document.date}</Text>
                <Text style={styles.value}>رقم الوثيقة: {document.id}</Text>
            </View>

            <View style={styles.footer}>
                <Text>هذه الوثيقة صادرة إلكترونياً من بوابة بلدية أم بطين</Text>
                <Text>© {new Date().getFullYear()} جميع الحقوق محفوظة</Text>
            </View>
        </Page>
    </Document>
);

export default ProfileDocument;