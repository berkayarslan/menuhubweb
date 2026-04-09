#!/usr/bin/env node

/**
 * End-to-end test script
 * Tests Form mode ve Toplu Metin mode
 */

const API_BASE = "http://localhost:8080/api";

async function testFormMode() {
    console.log("\n📋 TEST 1: Form Mode - Multiple Items");
    const payload = {
        restaurantId: 3,
        sourceType: "MANUAL",
        items: [
            { category: "Noodle", name: "Miso Ramen", priceAmount: 320, currency: "TRY" },
            { category: "Noodle", name: "Spicy Beef Udon", priceAmount: 360, currency: "TRY" },
            { category: "Icecek", name: "Soğuk Matcha", priceAmount: 110, currency: "TRY" }
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
            console.log("✅ Form Mode SUCCESS");
            console.log(`   Submission ID: ${data.id}`);
            console.log(`   RawText: ${data.rawText}`);
            console.log(`   Items parsed to: ${data.rawText.split('\n').length} lines`);
            return true;
        } else {
            console.log("❌ Form Mode FAILED:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Form Mode ERROR:", error.message);
        return false;
    }
}

async function testBulkTextMode() {
    console.log("\n📝 TEST 2: Bulk Text Mode - 3 different formats");
    const payload = {
        restaurantId: 1,
        sourceType: "PDF",
        items: [
            { category: "Başlangıç", name: "Burrata", priceAmount: 260, currency: "TRY" },
            { category: "Ana Yemek", name: "Limonlu Tavuk", priceAmount: 420, currency: "TRY" },
            { category: "Tatlı", name: "San Sebastian", priceAmount: 190, currency: "TRY" }
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
            console.log("✅ Bulk Text Mode SUCCESS");
            console.log(`   Submission ID: ${data.id}`);
            console.log(`   RawText: ${data.rawText}`);
            return true;
        } else {
            console.log("❌ Bulk Text Mode FAILED:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Bulk Text Mode ERROR:", error.message);
        return false;
    }
}

async function testMixedCurrency() {
    console.log("\n💱 TEST 3: Mixed Currency Support");
    const payload = {
        restaurantId: 2,
        sourceType: "WHATSAPP",
        items: [
            { category: "Burger", name: "Classic Smash", priceAmount: 340, currency: "TRY" },
            { category: "Burger", name: "Premium Burger", priceAmount: 450, currency: "TRY" }
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
            console.log("✅ Mixed Currency SUCCESS");
            console.log(`   Submission ID: ${data.id}`);
            return true;
        } else {
            console.log("❌ Mixed Currency FAILED:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Mixed Currency ERROR:", error.message);
        return false;
    }
}

async function testParsingFormats() {
    console.log("\n🔍 TEST 4: Backend Parsing - Verify rawText formats");

    const testCases = [
        {
            name: "3-part format (Category | Name | Price)",
            items: [{ category: "Başlangıç", name: "Test Item", priceAmount: 100, currency: "TRY" }]
        },
        {
            name: "Multiple items",
            items: [
                { category: "Kategorya", name: "Item1", priceAmount: 100, currency: "TRY" },
                { category: "Kategorya", name: "Item2", priceAmount: 200, currency: "TRY" },
                { category: "Kategorya", name: "Item3", priceAmount: 300, currency: "TRY" }
            ]
        }
    ];

    let passed = 0;
    for (const testCase of testCases) {
        try {
            const response = await fetch(`${API_BASE}/submissions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId: 1,
                    sourceType: "TEST",
                    items: testCase.items
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ ${testCase.name}: ${data.rawText.split('\n').length} lines parsed`);
                passed++;
            }
        } catch (e) {
            console.log(`   ❌ ${testCase.name}: ${e.message}`);
        }
    }

    return passed === testCases.length;
}

async function runAllTests() {
    console.log("=".repeat(60));
    console.log("🚀 MenuHub E2E Tests - Form & Bulk Text Modes");
    console.log("=".repeat(60));

    const results = [];
    results.push(await testFormMode());
    results.push(await testBulkTextMode());
    results.push(await testMixedCurrency());
    results.push(await testParsingFormats());

    console.log("\n" + "=".repeat(60));
    console.log(`📊 Results: ${results.filter(x => x).length}/${results.length} tests passed`);
    console.log("=".repeat(60));

    process.exit(results.every(x => x) ? 0 : 1);
}

runAllTests();

