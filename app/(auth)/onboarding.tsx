import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'Welcome to Xendly',
    subtitle: 'Your gateway to seamless cross-border payments across East Africa',
    image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    title: 'Send Money Instantly',
    subtitle: 'Transfer funds to Kenya, Uganda, Tanzania, Rwanda, and Burundi in seconds',
    image: 'https://images.pexels.com/photos/4497591/pexels-photo-4497591.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    title: 'Powered by Stellar',
    subtitle: 'Secure, fast, and low-cost transactions using blockchain technology',
    image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors } = useTheme();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const currentData = onboardingData[currentIndex];

  return (
    <ThemedBackground>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentData.image }} style={styles.image} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentData.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {currentData.subtitle}
          </Text>

          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="outline"
            style={styles.skipButton}
          />
          <Button
            title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});