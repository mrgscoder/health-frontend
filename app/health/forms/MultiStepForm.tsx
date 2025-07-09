import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Inform from './Inform';
import LifestyleForm from './LifestyleForm';
import Wellness from './Wellness';
import Result from './Result';

interface InformData {
  name: string;
  height: string;
  weight: string;
}

interface LifestyleData {
  activityLevel: string;
  sleepHours: string;
  dietPreference: string;
}

interface WellnessData {
  goal: string;
  stress: string;
}

const MultiStepForm = () => {
  const [step, setStep] = useState(1);

  const [informData, setInformData] = useState<InformData | null>(null);
  const [lifestyleData, setLifestyleData] = useState<LifestyleData | null>(null);
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Step Indicators */}
        {step <= 3 && (
          <View className="flex-row justify-center mt-4 mb-4">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`w-3 h-3 mx-1 rounded-full ${step === s ? 'bg-[#0cb6ab]' : 'bg-gray-300'}`}
              />
            ))}
          </View>
        )}

        {step === 1 && (
          <Inform
            onNext={(data) => {
              setInformData(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <LifestyleForm
            onNext={(data) => {
              setLifestyleData(data);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <Wellness
            onNext={(data) => {
              setWellnessData(data);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <Result
            height={informData?.height ?? null}
            weight={informData ? { value: parseFloat(informData.weight), unit: 'kg' } : null}
            route={{
              params: {
                name: informData?.name ?? '',
                height: informData?.height ? parseFloat(informData.height) : 170,
                weight: informData?.weight ? parseFloat(informData.weight) : 70,
                activityLevel: (lifestyleData?.activityLevel ?? 'Lightly Active') as any,
                sleepHours: lifestyleData?.sleepHours ? parseInt(lifestyleData.sleepHours, 10) : 7,
                dietPreference: lifestyleData?.dietPreference ?? 'Balanced',
                stressLevel: (wellnessData?.stress ?? 'Moderate') as any,
                healthGoal: wellnessData?.goal ?? 'General Wellness',
              },
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MultiStepForm;
