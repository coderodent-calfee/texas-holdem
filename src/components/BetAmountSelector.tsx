// src/components/BetAmountSelector.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Button } from "react-native";
import ProgressBar from "./ProgressBar";
import { AllowedActions } from "../engine/BettingEngine";
import { FIVE_DOLLAR_CHIP, TEN_DOLLAR_CHIP, TWENTY_FIVE_DOLLAR_CHIP, ONE_DOLLAR_CHIP, ONE_HUNDRED_DOLLAR_CHIP } from "../components/Chip";
import DealerChip from "./DealerChip";

export interface BetAmountSelectorProps {
    allowed: AllowedActions;
    mode: "bet" | "raise";
    stack: number;

    // Callbacks
    onConfirm: (amount: number, action: "bet" | "raise" | "call" | "check" | "fold" | "all-in") => void;
    onCancel: () => void;
}


export const BetAmountSelector: React.FC<BetAmountSelectorProps> = ({
    allowed,
    mode,
    stack,
    onConfirm,
    onCancel,
}) => {

    const callAmount = allowed.callAmount ?? 0;

    const min = useMemo(() => {
        if (mode === "bet") { return allowed.minBet ?? 0; }
        // raise action
        return callAmount + (allowed.minRaise ?? 0);
    }, [mode, allowed, callAmount]);

    const max = useMemo(() => {
        // can't exceed stack
        return Math.min(allowed.maxBet ?? stack, stack);
    }, [allowed, stack]);

    const startingAmount = (min === 0 ? 1 : min);
    const [amount, setAmount] = useState(startingAmount);

    const quickBets = [
        { label: "Min", value: min },
        {
            label: "1/2 Pot",
            value: Math.min(Math.floor(max * 0.5), stack)
        },
        {
            label: "Pot",
            value: Math.min(max, stack)
        },
        {
            label: "All-in",
            value: stack
        },
    ];

    // Only add "Raise" button if mode is raise
    if (mode === "raise" && allowed.minRaise !== null) {
        quickBets.unshift({
            label: "Raise",
            value: callAmount + allowed.minRaise!
        });
    }


    const chipSize = 30;
    const clamp = (v: number) => Math.max(min, Math.min(v, max));
    console.log(`mode: ${mode} `, allowed);
    console.log(`stack: ${stack}`);
    console.log(`current amount: ${amount}`);
    const allowCheck = allowed.canCheck;
    const allowCall = allowed.canCall && !allowCheck;  // no dual display

    const getConfirmAction = (): "bet" | "raise" | "call" | "check" | "all-in" => {
        if (allowCheck && amount === 0) return "check";
        if (allowCall && amount === callAmount) return "call";
        if (amount >= stack) return "all-in";
        return mode; // "bet" or "raise"
    };


    return (
        <View style={{ padding: 16, backgroundColor: "#222", borderRadius: 12 }}>
            <Text style={{ color: "white", fontSize: 18, marginBottom: 12 }}>
                Select Bet Amount
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {quickBets.map((qb) => (
                    <View key={qb.label} style={{ marginHorizontal: 4 }}>
                        <Button title={qb.label} onPress={() => setAmount(qb.value)} />
                    </View>
                ))}
            </View>

            <View style={{ padding: 16, gap: 2, }}>


                {/* -1 / +1 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...ONE_DOLLAR_CHIP}
                        text="-1"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev - 1))}
                    />

                    <ProgressBar
                        value={amount}
                        maxValue={stack}
                        barColor={ONE_DOLLAR_CHIP.color}
                        style={{ width: 300, height: 20 }}
                    />

                    <DealerChip
                        {...ONE_DOLLAR_CHIP}
                        text="+1"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev + 1))}
                    />
                </View>


                {/* -5 / +5 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...FIVE_DOLLAR_CHIP}
                        text="-5"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev - 5))}
                    />

                    <ProgressBar
                        value={amount}
                        maxValue={stack}
                        barColor={FIVE_DOLLAR_CHIP.color}
                        style={{ width: 300, height: 20 }}
                    />

                    <DealerChip
                        {...FIVE_DOLLAR_CHIP}
                        text="+5"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev + 5))}
                    />
                </View>


                {/* -10 / +10 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...TEN_DOLLAR_CHIP}
                        text="-10"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev - 10))}
                    />

                    <ProgressBar
                        value={amount}
                        maxValue={stack}
                        barColor={TEN_DOLLAR_CHIP.color}
                        style={{ width: 300, height: 20 }}
                    />

                    <DealerChip
                        {...TEN_DOLLAR_CHIP}
                        text="+10"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev + 10))}
                    />
                </View>


                {/* -25 / +25 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...TWENTY_FIVE_DOLLAR_CHIP}
                        text="-25"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev - 25))}
                    />

                    <ProgressBar
                        value={amount}
                        maxValue={stack}
                        barColor={TWENTY_FIVE_DOLLAR_CHIP.color}
                        style={{ width: 300, height: 20 }}
                    />

                    <DealerChip
                        {...TWENTY_FIVE_DOLLAR_CHIP}
                        text="+25"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev + 25))}
                    />
                </View>


                {/* -100 / +100 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...ONE_HUNDRED_DOLLAR_CHIP}
                        text="-100"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev - 100))}
                    />

                    <ProgressBar
                        value={amount}
                        maxValue={stack}
                        barColor={ONE_HUNDRED_DOLLAR_CHIP.color}
                        style={{ width: 300, height: 20 }}
                    />

                    <DealerChip
                        {...ONE_HUNDRED_DOLLAR_CHIP}
                        text="+100"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => clamp(prev + 100))}
                    />
                </View>

            </View>
            <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>
                Wager: {amount}
            </Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

                {onCancel && (
                    <Button color="#888" title="Cancel" onPress={onCancel} />
                )}

                {/* Check */}
                {allowCheck && (
                    <Button
                        title="Check"
                        onPress={() => onConfirm(0, "check")}
                    />
                )}

                {/* Call */}
                {allowCall && (
                    <Button
                        title={`Call ${callAmount}`}
                        onPress={() => onConfirm(callAmount, "call")}
                    />
                )}

                {/* Main Confirm */}
                <Button
                    title={mode === "bet" ? "Bet" : "Raise"}
                    onPress={() => {
                        const action = getConfirmAction();
                        onConfirm(amount, action);
                    }}
                />
            </View>
        </View>
    );
};