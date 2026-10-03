import { useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/lib/constants';

export default function NovaTabScreen() {
  const router = useRouter();

  useFocusEffect(() => {
    router.replace('/nova-ocorrencia');
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>A redirecionar...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  text: { fontFamily: 'Inter-Regular', fontSize: 14, color: THEME.textMuted },
});
