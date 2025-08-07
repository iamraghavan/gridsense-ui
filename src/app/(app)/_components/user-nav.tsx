'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import { logout } from '@/lib/actions';

interface UserNavProps {
    user: User;
}

export function UserNav({ user }: UserNavProps) {
    const [open, setOpen] = useState(false);
    const userInitials = user.name.split(' ').map(n => n[0]).join('');

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="relative h-auto gap-2 p-1 rounded-full flex items-center"
                    onMouseEnter={() => setOpen(true)}
                >
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                onMouseLeave={() => setOpen(false)}
            >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>API Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logout}>
                    <button type="submit" className="w-full">
                        <DropdownMenuItem>
                            Logout
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
