#!/usr/bin/env node

/**
 * Admin panel tests
 * Tests admin login ve submissions listing
 */

const API_BASE = "http://localhost:8080/api";

let authToken = null;

async function adminLogin() {
    console.log("\n🔐 Admin Login Test");
    const payload = {
        username: "admin",
        password: "admin123"
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            console.log("✅ Login SUCCESS");
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            console.log("❌ Login FAILED:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Login ERROR:", error.message);
        return false;
    }
}

async function listSubmissions() {
    console.log("\n📋 Get Admin Submissions");

    if (!authToken) {
        console.log("❌ Not authenticated");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/submissions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Retrieved ${data.length} submissions`);

            // Show recent submissions
            data.slice(0, 3).forEach((sub, idx) => {
                console.log(`\n   Submission #${idx + 1}:`);
                console.log(`     ID: ${sub.id}`);
                console.log(`     Restaurant: ${sub.restaurantName || "Unknown"}`);
                console.log(`     Status: ${sub.status}`);
                console.log(`     Source: ${sub.sourceType}`);
                console.log(`     Items: ${sub.rawText.split('\n').length} lines`);
            });

            return true;
        } else if (response.status === 403) {
            console.log("❌ Access Forbidden (check JWT token)");
            return false;
        } else {
            console.log("❌ Failed:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ ERROR:", error.message);
        return false;
    }
}

async function approveSubmission(submissionId) {
    console.log(`\n✅ Approve Submission #${submissionId}`);

    if (!authToken) {
        console.log("❌ Not authenticated");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({})
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`   Status changed to: ${data.status}`);
            return true;
        } else {
            console.log("❌ Approve failed:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Approve ERROR:", error.message);
        return false;
    }
}

async function rejectSubmission(submissionId) {
    console.log(`\n❌ Reject Submission #${submissionId}`);

    if (!authToken) {
        console.log("❌ Not authenticated");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/reject`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({})
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`   Status changed to: ${data.status}`);
            return true;
        } else {
            console.log("❌ Reject failed:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Reject ERROR:", error.message);
        return false;
    }
}

async function runAdminTests() {
    console.log("=".repeat(60));
    console.log("👨‍💼 MenuHub Admin Panel Tests");
    console.log("=".repeat(60));

    if (!await adminLogin()) {
        console.log("\n❌ Cannot continue without authentication");
        process.exit(1);
    }

    await listSubmissions();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Admin tests completed");
    console.log("=".repeat(60));
}

runAdminTests();

