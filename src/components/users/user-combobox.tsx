"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isValidEmail, cn } from "@/lib/utils";
import { useUsers } from "@/hooks/use-users";

interface User {
  id: string;
  username: string;
  displayName: string;
  imageUrl?: string;
  avatarUrl?: string;
}

interface ApiUser {
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl?: string;
  avatarUrl?: string;
}

interface UserComboboxProps {
  onSelect: (value: { type: 'user', userId: string, username: string } | { type: 'email', email: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  userIds?: string[];
}

export function UserCombobox({ onSelect, placeholder = "Search users...", disabled, userIds }: UserComboboxProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const { data: initialUsers, isLoading: isLoadingInitial } = useUsers(userIds);

  // Set initial users from the useUsers hook
  React.useEffect(() => {
    if (initialUsers && !searchValue) {
      setUsers(initialUsers.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        imageUrl: user.imageUrl || undefined
      })));
    }
  }, [initialUsers, searchValue]);

  // Search users as you type
  React.useEffect(() => {
    const searchUsers = async () => {
      if (!searchValue) {
        // Reset to initial users when search is cleared
        if (initialUsers) {
          setUsers(initialUsers.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            imageUrl: user.imageUrl || undefined
          })));
        }
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchValue)}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setUsers(data.map((user: ApiUser) => ({
          id: user.clerkId,
          username: user.username,
          displayName: user.displayName,
          imageUrl: user.imageUrl,
          avatarUrl: user.avatarUrl
        })));
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchValue, initialUsers]);

  const handleSelect = (user: User) => {
    onSelect({ type: 'user', userId: user.id, username: user.username });
    setSearchValue("");
    setShowDropdown(false);
  };

  const handleEmailInvite = () => {
    if (isValidEmail(searchValue)) {
      onSelect({ type: 'email', email: searchValue });
      setSearchValue("");
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          // Delay hiding dropdown to allow click events to fire
          setTimeout(() => setShowDropdown(false), 200);
        }}
        disabled={disabled}
      />
      
      {showDropdown && (
        <div className="absolute w-full mt-1 py-1 bg-background rounded-md border shadow-md z-50">
          {(isLoading || isLoadingInitial) ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              Loading...
            </div>
          ) : (
            <>
              {users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent",
                    "transition-colors"
                  )}
                  onClick={() => handleSelect(user)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || user.imageUrl} />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
              ))}
              {isValidEmail(searchValue) && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent",
                    "transition-colors"
                  )}
                  onClick={handleEmailInvite}
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Invite {searchValue} by email</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 