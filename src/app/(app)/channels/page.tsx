
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import type { Channel } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockChannels: Channel[] = [
    { id: 'ch_1', name: 'Weather Station', description: 'Tracks temperature and humidity in the main office.', createdAt: '2023-10-01T12:00:00Z', field1: 'Temperature', field2: 'Humidity', field3: 'Pressure', field4: '', field5: '', field6: '', field7: '', field8: ''},
    { id: 'ch_2', name: 'Greenhouse Monitor', description: 'Monitors soil moisture and light levels.', createdAt: '2023-10-05T14:30:00Z', field1: 'Soil Moisture', field2: 'Light Lux', field3: 'Air Temp', field4: 'Air Humidity', field5: '', field6: '', field7: '', field8: ''},
    { id: 'ch_3', name: 'Server Room Vitals', description: 'Keeps an eye on server room temperature and door status.', createdAt: '2023-10-10T09:00:00Z', field1: 'Temperature', field2: 'Door Sensor', field3: '', field4: '', field5: '', field6: '', field7: '', field8: ''},
    { id: 'ch_4', name: 'Aquaponics System', description: 'pH and water level for the aquaponics tank.', createdAt: '2023-10-15T18:00:00Z', field1: 'pH Level', field2: 'Water Level', field3: 'Water Temp', field4: '', field5: '', field6: '', field7: '', field8: ''},
];

export default function ChannelsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Manage your data channels for your IoT devices.
          </CardDescription>
        </div>
        <div>
            <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Channel
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Fields</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockChannels.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">{channel.description}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                        {[channel.field1, channel.field2, channel.field3, channel.field4, channel.field5, channel.field6, channel.field7, channel.field8].map((field, index) => field ? <Badge key={index} variant="outline">{field}</Badge> : null)}
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(channel.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Data</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
