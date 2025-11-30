// src/components/BetAmountSelector.tsx
import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import ProgressBar from "./ProgressBar";
import {  } from "../engine/BettingEngine";
import { FIVE_DOLLAR_CHIP, TEN_DOLLAR_CHIP, TWENTY_FIVE_DOLLAR_CHIP, ONE_DOLLAR_CHIP, ONE_HUNDRED_DOLLAR_CHIP } from "../components/Chip";
import DealerChip from "./DealerChip";

interface BetAmountSelectorProps {
    min: number;
    max: number;
    stack: number;
    onConfirm: (amount: number) => void;
    onCancel?: () => void;
}

export const BetAmountSelector: React.FC<BetAmountSelectorProps> = ({
    min,
    max,
    stack,
    onConfirm,
    onCancel,
}) => {
    const [amount, setAmount] = useState(min);

    const quickBets = [
        { label: "Min", value: min },
        { label: "1/2 Pot", value: Math.min(Math.floor(max * 0.5), stack) },
        { label: "Pot", value: Math.min(max, stack) },
        { label: "All-in", value: stack },
    ];
    const chipSize = 30;
    console.log(`min: ${min}`);
    console.log(`max: ${max}`);
    console.log(`stack: ${stack}`);
    console.log(`current amount: ${amount}`);
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

            <View style={{
                padding: 16, gap: 2,
            }}>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...ONE_DOLLAR_CHIP}
                        text="-1"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => {
                            console.log("-1 onPress");
                            setAmount(prev => Math.max(prev - 1, min))}}
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
                        onPress={() =>{
                            setAmount(
                                (prev) =>
                                {
                                    const amount =  Math.min(prev + 1, Math.min(max, stack));
                                    return amount;
                                }
                            );
                        }}

                    />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...FIVE_DOLLAR_CHIP}
                        text="-5"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => Math.max(prev - 5, min))}
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
                        onPress={() =>
                            setAmount(prev =>
                                Math.min(prev + 5, Math.min(max, stack))
                            )
                        }
                    />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...TEN_DOLLAR_CHIP}
                        text="-10"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => Math.max(prev - 10, min))}
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
                        onPress={() =>
                            setAmount(prev =>
                                Math.min(prev + 10, Math.min(max, stack))
                            )
                        }
                    />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...TWENTY_FIVE_DOLLAR_CHIP}
                        text="-25"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => setAmount(prev => Math.max(prev - 25, min))}
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
                        onPress={() =>
                            setAmount(prev =>
                                Math.min(prev + 25, Math.min(max, stack))
                            )
                        }
                    />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <DealerChip
                        {...ONE_HUNDRED_DOLLAR_CHIP}
                        text="-100"
                        size={chipSize}
                        lineHeight={80}
                        onPress={() => {
                            console.log("-100 onPress");
                            setAmount(prev => Math.max(prev - 100, min))}}
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
                        onPress={() =>{
                            setAmount(
                                (prev) =>
                                {
                                    const amount =  Math.min(prev + 100, Math.min(max, stack));
                                    return amount;
                                }
                            );
                        }}

                    />
                </View>

            </View>
            <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>
                Bet: {amount}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {onCancel && (
                    <Button color="#888" title="Cancel" onPress={onCancel} />
                )}
                <Button title="Confirm Bet" onPress={() => onConfirm(amount)} />
            </View>
        </View>
    );
};
