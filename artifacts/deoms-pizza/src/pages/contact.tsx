import { useGetSettings } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, MessageCircle } from "lucide-react";

export default function Contact() {
  const { data: settings, isLoading } = useGetSettings();

  return (
    <MainLayout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase text-primary text-center">Contact Us</h1>
        <p className="text-muted-foreground text-center mb-12 text-lg">We'd love to hear from you!</p>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-32 bg-muted rounded-xl"></div>
          </div>
        ) : settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-6">For instant orders and inquiries.</p>
                <a href={`tel:${settings.ownerPhone}`} className="w-full">
                  <Button className="w-full rounded-full" size="lg">
                    {settings.ownerPhone}
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">WhatsApp</h3>
                <p className="text-muted-foreground mb-6">Chat with us for party orders.</p>
                <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white" size="lg">
                    Chat on WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Visit Us</h3>
                <p className="text-muted-foreground max-w-md">{settings.shopAddress}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}