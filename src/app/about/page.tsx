import Image from "next/image";
import Link from "next/link";
import { Heart, List, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <MobileNav />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/Favely-logo.svg"
                  alt="Favely"
                  className="h-[30px] w-[120px]"
                  width={120}
                  height={30}
                  priority
                />
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Button 
                className="bg-[#801CCC] hover:bg-[#801CCC]/90 text-white"
                asChild
              >
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#801CCC]/5 to-transparent" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Create, Share & <span className="text-[#801CCC]">Discover</span> Lists
                </h1>
                <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                  Your personal space to curate and share collections of anything - from recipes to movies, books to
                  travel spots.
                </p>
              </div>
              <Button 
                className="mt-6 px-8 py-3 text-lg font-semibold bg-[#801CCC] hover:bg-[#801CCC]/90 text-white"
                size="lg"
                asChild
              >
                <Link href="/sign-up">
                  Start Creating Lists
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-muted/50 py-20">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              What Will You <span className="text-[#801CCC]">Create</span>?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-[#801CCC]/5 hover:border-[#801CCC]/20">
                <h3 className="text-xl font-bold mb-4">Travel</h3>
                <h4 className="text-[#801CCC] font-semibold mb-2">Hidden Gems in Tokyo</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Secret ramen spots</li>
                  <li>• Local markets</li>
                  <li>• Off-beat attractions</li>
                </ul>
              </div>
              <div className="group rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-[#801CCC]/5 hover:border-[#801CCC]/20">
                <h3 className="text-xl font-bold mb-4">Books</h3>
                <h4 className="text-[#801CCC] font-semibold mb-2">Must-Read Sci-Fi Novels</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Classic masterpieces</li>
                  <li>• New discoveries</li>
                  <li>• Hidden gems</li>
                </ul>
              </div>
              <div className="group rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-[#801CCC]/5 hover:border-[#801CCC]/20">
                <h3 className="text-xl font-bold mb-4">Food</h3>
                <h4 className="text-[#801CCC] font-semibold mb-2">Comfort Food Recipes</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Family favorites</li>
                  <li>• Quick & easy meals</li>
                  <li>• Grandma&apos;s secrets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              Everything You Need - <span className="text-[#801CCC]">For Free</span>
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              {[
                {
                  icon: List,
                  title: "Create Lists",
                  description: "Organize your interests into beautiful, shareable collections. Easily add, edit, and arrange items in your lists."
                },
                {
                  icon: Share2,
                  title: "Share Easily",
                  description: "Share your curated lists with friends or the community. Control privacy settings for each list you create."
                },
                {
                  icon: Heart,
                  title: "Save Favorites",
                  description: "Pin and save lists that inspire you for later. Easily access your favorite collections anytime."
                },
                {
                  icon: Users,
                  title: "Collaborate",
                  description: "Work together with others on shared collections. Perfect for team projects or group planning."
                }
              ].map((feature) => (
                <div 
                  key={feature.title}
                  className={cn(
                    "group flex flex-col items-start space-y-3 rounded-lg border bg-card p-6",
                    "transition-all duration-200 hover:shadow-lg hover:shadow-[#801CCC]/5",
                    "hover:border-[#801CCC]/20"
                  )}
                >
                  <feature.icon className="h-10 w-10 text-[#801CCC] transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#801CCC]/5 to-transparent" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Start <span className="text-[#801CCC]">Listing</span>?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-lg">
                Join Favely today and start creating, sharing, and discovering amazing collections.
              </p>
              <Button 
                className="mt-6 px-8 py-3 text-lg font-semibold bg-[#801CCC] hover:bg-[#801CCC]/90 text-white"
                size="lg"
                asChild
              >
                <Link href="/sign-up">
                  Sign Up Now
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 Favely. All rights reserved.</p>
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/about/terms" className="text-muted-foreground hover:text-[#801CCC]">
              Terms
            </Link>
            <Link href="/about/privacy" className="text-muted-foreground hover:text-[#801CCC]">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 