import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import notifee, {
    AuthorizationStatus,
    EventType,
    AndroidImportance,
    TriggerType
    
} from '@notifee/react-native';



export default function App() {
    const [statusNotification, setStatusNotification] = useState(true);

    useEffect(() => {
        async function getPermission() {
            const authStatus = await notifee.requestPermission();
            if (authStatus.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
                console.log('Permitiu', authStatus.authorizationStatus);
                setStatusNotification(true)
            } else {
                console.log('Usuario negou a permissão');
                setStatusNotification(true)
            }
        }

        getPermission();
    }, []);

    notifee.onBackgroundEvent( async ({ type, detail }) => {
        const { notification, pressAction } = detail;
        if(type == EventType.PRESS) {
            console.log('Notificação pressionada no background', pressAction?.id);
            if(notification?.id){
                await notifee.cancelNotification(notification.id);
            }
        }
        console.log('Notificação recebida no background');
    })
    useEffect(() => {
        return notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.PRESS:
                    console.log('Tocou', detail.notification);
                    break;
                case EventType.DISMISSED:
                    console.log('Usuario descartou a notificação', detail.notification);
                    break;
                // default:
                //   console.log('Unhandled event type:', type);
            }
        });
    }, [])

    async function handleNotification() {
        if (!statusNotification) {
            console.log('Notificação não permitida');
            return;
        }
        const channelId = await notifee.createChannel({
            id: 'lembrete',
            name: 'Lembrete',
            vibration: true,
            importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
            title: 'Lembrete',
            body: 'Lembrete para estudar reactive-native amanhã',
            android: {
                channelId,
                pressAction: {
                    id: 'default',
                },
            },
        })

    }
    async function handleScheduleNotification() {
        const date = new Date(Date.now())

        date.setMinutes(date.getMinutes() + 1);

        const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
        }
        await notifee.createTriggerNotification({
            title: 'Lembrete',
            body: 'Estudar JavaScript',
            android: {
                channelId: 'lembrete',
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
            },
        }, trigger);

        console.log('Notificação agendada para', date);

    }
    return (
        <View style={styles.container}>
            <Text>Welcome to the Notification App!</Text>
            <Button
                title='Enviar Notificação'
                onPress={handleNotification} />
            <Button
                title='Agendar Notificação'
                onPress={handleScheduleNotification} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})