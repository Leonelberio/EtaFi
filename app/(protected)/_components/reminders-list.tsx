// @ts-nocheck


import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Trash2, AlarmClock } from "lucide-react";

export default function ReminderList({ reminders, onDeleteReminder }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Rappels</h2>
      {reminders.length > 0 ? (
        reminders.map((reminder) => (
          <div key={reminder.id} className="m-4">
            <CardContent className="flex items-center gap-4">
              {/* Alarm Icon */}
              <AlarmClock className="w-5 h-5 text-blue-500" />
              
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{reminder.type}</p>
                <p className="text-xs text-muted-foreground"> {reminder.exerciceId}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 ml-auto"
                onClick={() => onDeleteReminder(reminder.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </div>
        ))
      ) : (
        <p>Aucun rappel trouvé</p>
      )}
    </div>
  );
}
