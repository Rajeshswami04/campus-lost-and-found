import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import Link from "next/link"

import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function Navigationeditprofile() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/profile">Edit Profile</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}
export function Navigationfound() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/found">Found</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

export function Navigationlost() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/lost">Lost</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

export function Navigationlogout() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/logout">Lost</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}