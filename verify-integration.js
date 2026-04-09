#!/usr/bin/env node

/**
 * MenuHub Integration - Final Verification
 *
 * Bu script:
 * 1. Form Mode submission gönderir
 * 2. Toplu Metin Mode submission gönderir
 * 3. Admin login yapar
 * 4. Submissions'ları listeler
 * 5. Bir submission'ı approve eder
 * 6. Status güncellenmiş mi kontrol eder
 */

const API_BASE = "http://localhost:8080/api";
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(color, msg) {
    console.log(`${color}${msg}${COLORS.reset}`);
}

async function verifyFormMode() {
    log(COLORS.blue, '\n📋 [1/5] Verifying Form Mode...');

    const payload = {
        restaurantId: 1,
        sourceType: "MANUAL",
        items: [
            { category: "Başlangıç", name: "Test Item 1", priceAmount: 100, currency: "TRY" },
            { category: "Ana Yemek", name: "Test Item 2", priceAmount: 200, currency: "TRY" }
        ]
    };

    try {
        const response = await fetch(`${API_BASE}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            log(COLORS.green, `✅ Form Mode: Submission ID ${data.id} created`);
            log(COLORS.green, `   Items: ${data.rawText.split('\n').length}, Status: ${data.status}`);
            return true;
        } else {
            log(COLORS.red, `❌ Form Mode failed: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ Form Mode error: ${error.message}`);
        return false;
    }
}

async function verifyBulkTextMode() {
    log(COLORS.blue, '\n📝 [2/5] Verifying Bulk Text Mode...');

    const payload = {
        restaurantId: 2,
        sourceType: "PDF",
        items: [
            { category: "Burger", name: "Classic", priceAmount: 300, currency: "TRY" },
            { category: "Burger", name: "Premium", priceAmount: 400, currency: "TRY" },
            { category: "Icecek", name: "Soft Drink", priceAmount: 50, currency: "TRY" }
        ]
    };

    try {
        const response = await fetch(`${API_BASE}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            log(COLORS.green, `✅ Bulk Text: Submission ID ${data.id} created`);
            log(COLORS.green, `   Items: ${data.rawText.split('\n').length}, Status: ${data.status}`);
            return true;
        } else {
            log(COLORS.red, `❌ Bulk Text failed: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ Bulk Text error: ${error.message}`);
        return false;
    }
}

async function verifyAdminLogin() {
    log(COLORS.blue, '\n🔐 [3/5] Verifying Admin Login...');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "admin123" })
        });

        if (response.ok) {
            const data = await response.json();
            global.adminToken = data.token;
            log(COLORS.green, `✅ Admin login successful`);
            log(COLORS.green, `   Token: ${data.token.substring(0, 20)}...`);
            return true;
        } else {
            log(COLORS.red, `❌ Admin login failed: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ Admin login error: ${error.message}`);
        return false;
    }
}

async function verifySubmissionsList() {
    log(COLORS.blue, '\n📋 [4/5] Verifying Admin Submissions List...');

    if (!global.adminToken) {
        log(COLORS.red, `❌ Not authenticated`);
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/submissions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${global.adminToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const pending = data.filter(s => s.status === "PENDING_REVIEW").length;
            const approved = data.filter(s => s.status === "APPROVED").length;

            log(COLORS.green, `✅ Submissions list retrieved`);
            log(COLORS.green, `   Total: ${data.length}, Pending: ${pending}, Approved: ${approved}`);

            global.pendingSubmission = data.find(s => s.status === "PENDING_REVIEW");
            return true;
        } else {
            log(COLORS.red, `❌ Failed to get submissions: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ Error: ${error.message}`);
        return false;
    }
}

async function verifyApproval() {
    log(COLORS.blue, '\n✅ [5/5] Verifying Submission Approval...');

    if (!global.adminToken || !global.pendingSubmission) {
        log(COLORS.red, `❌ Missing prerequisites`);
        return false;
    }

    try {
        const submissionId = global.pendingSubmission.id;
        const response = await fetch(
            `${API_BASE}/admin/submissions/${submissionId}/approve`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${global.adminToken}`
                },
                body: JSON.stringify({})
            }
        );

        if (response.ok) {
            const data = await response.json();
            log(COLORS.green, `✅ Submission approved`);
            log(COLORS.green, `   ID: ${data.id}, Status: ${data.status}`);
            log(COLORS.green, `   Items parsed to: ${data.rawText.split('\n').length} lines`);
            return data.status === "APPROVED";
        } else {
            log(COLORS.red, `❌ Approval failed: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        log(COLORS.red, `❌ Error: ${error.message}`);
        return false;
    }
}

async function runVerification() {
    log(COLORS.yellow, '='.repeat(60));
    log(COLORS.yellow, '🚀 MenuHub Integration Verification');
    log(COLORS.yellow, '='.repeat(60));

    const results = [];
    results.push(await verifyFormMode());
    results.push(await verifyBulkTextMode());
    results.push(await verifyAdminLogin());
    results.push(await verifySubmissionsList());
    results.push(await verifyApproval());

    log(COLORS.yellow, '\n' + '='.repeat(60));

    const passed = results.filter(x => x).length;
    if (passed === 5) {
        log(COLORS.green, `✅ ALL VERIFICATIONS PASSED (${passed}/5)`);
        log(COLORS.green, '🎉 System is ready for production!');
    } else {
        log(COLORS.red, `⚠️  Some checks failed (${passed}/5)`);
    }

    log(COLORS.yellow, '='.repeat(60));

    process.exit(passed === 5 ? 0 : 1);
}

runVerification();

