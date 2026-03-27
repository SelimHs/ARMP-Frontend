import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { ReservationMenuService } from '../../services/reservationmenu.service';
import { Menu } from '../../models/menu';
import { ChatMessage, ChatSession } from '../../models/chatbot';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() menus: Menu[] = [];
  @Input() selectedDate: string = '';
  @Output() bookingCompleted = new EventEmitter<void>();
  
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  messageForm: FormGroup;
  loading = false;
  minimized = false;
  
  private session: ChatSession = {
    step: 'idle',
    selectedMenu: null,
    selectedDate: null,
    selectedTime: null
  };
  
  private userReservations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private chatbotService: ChatbotService,
    private reservationService: ReservationMenuService
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.addBotMessage("👋 Bonjour ! Je suis votre assistant de réservation.\n\n💡 **Dites-moi ce que vous voulez faire**\nExemples :\n• \"bouza\"\n• \"annuler ma réservation\"\n• \"mes réservations\"\n• \"affiche tous les menus\"\n• \"aide\"");
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {}

  scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleMinimize(): void {
    this.minimized = !this.minimized;
  }

  sendMessage(): void {
    if (this.messageForm.invalid) return;
    
    const userMessage = this.messageForm.get('message')?.value.trim();
    if (!userMessage) return;
    
    this.addUserMessage(userMessage);
    this.messageForm.reset();
    this.loading = true;
    
    setTimeout(() => {
      this.processUserInput(userMessage);
    }, 500);
  }

  sendQuickReply(text: string): void {
    this.messageForm.get('message')?.setValue(text);
    this.sendMessage();
  }

  async processUserInput(input: string): Promise<void> {
    const lowerInput = input.toLowerCase().trim();
    
    // Gestion des étapes de session
    if (this.session.step === 'selecting_menu') {
      await this.handleMenuSelection(lowerInput);
      return;
    }
    
    if (this.session.step === 'selecting_date') {
      await this.handleDateSelection(lowerInput);
      return;
    }
    
    if (this.session.step === 'selecting_alternative_date') {
      await this.handleAlternativeDateSelection(lowerInput);
      return;
    }
    
    if (this.session.step === 'selecting_time') {
      await this.handleTimeSelection(lowerInput);
      return;
    }
    
    if (this.session.step === 'confirming') {
      await this.handleConfirmation(lowerInput);
      return;
    }
    
    if (this.session.step === 'selecting_reservation_to_cancel') {
      await this.handleCancelReservationSelection(lowerInput);
      return;
    }
    
    if (this.session.step === 'confirming_cancellation') {
      await this.confirmCancellation(lowerInput);
      return;
    }
    
    // Commandes principales
    if (lowerInput === 'aide' || lowerInput === 'help' || lowerInput === 'que peux-tu faire') {
      this.showHelp();
      this.loading = false;
      return;
    }
    
    if (lowerInput === 'affiche tous les menus' || lowerInput === 'tous les menus' || lowerInput === 'menus' || lowerInput === 'liste des menus') {
      this.showAllMenus();
      this.loading = false;
      return;
    }
    
    // Annulation
    if (lowerInput.includes('annuler') || lowerInput === 'annuler ma réservation' || lowerInput === 'annuler reservation') {
      await this.showUserReservations();
      return;
    }
    
    // Mes réservations
    if (lowerInput.includes('mes réservations') || lowerInput === 'mes reservations' || lowerInput === 'affiche mes réservations') {
      await this.showUserReservations();
      return;
    }
    
    // Recherche de plats
    const searchTerm = this.chatbotService.extractSearchTermFromSentence(input);
    if (searchTerm) {
      await this.searchDish(searchTerm);
      return;
    }
    
    this.addBotMessage("Je n'ai pas compris. Dites **'aide'** pour voir ce que je peux faire.\n\n💡 Exemples :\n• \"annuler ma réservation\"\n• \"mes réservations\"\n• \"bouza\"");
    this.loading = false;
  }

  // ==================== ANNULATION DES RÉSERVATIONS ====================

  async showUserReservations(): Promise<void> {
    try {
      const reservations = await this.reservationService.getReservationMenusByUser(1).toPromise();
      
      if (!reservations || reservations.length === 0) {
        this.addBotMessage("📭 **Vous n'avez aucune réservation en cours.**\n\n💡 Voulez-vous en faire une ? Dites-moi ce que vous voulez manger.");
        this.loading = false;
        return;
      }
      
      this.userReservations = reservations;
      
      let response = "📋 **VOS RÉSERVATIONS**\n\n";
      
      for (let i = 0; i < reservations.length; i++) {
        const res = reservations[i];
        const formattedDate = this.chatbotService.formatDateFrench(res.date_reservation);
        response += `${i + 1}. **${res.menu.plat_principal}**\n`;
        response += `   📅 ${formattedDate}\n`;
        response += `   🕐 ${res.heure_recuperation?.substring(0, 5) || '12:30'}\n`;
        response += `   🥗 ${res.menu.entree} | 🍰 ${res.menu.dessert}\n\n`;
      }
      
      response += `💡 **Pour annuler une réservation**, répondez avec le **numéro** (ex: "1") ou dites "non" pour annuler.`;
      
      this.addBotMessage(response);
      this.session.step = 'selecting_reservation_to_cancel';
      this.loading = false;
      
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      this.addBotMessage("❌ Erreur lors du chargement de vos réservations.");
      this.loading = false;
    }
  }

  async handleCancelReservationSelection(input: string): Promise<void> {
    if (input === 'non' || input === 'annuler') {
      this.session.step = 'idle';
      this.addBotMessage("D'accord, annulation annulée. Que voulez-vous faire d'autre ?");
      this.loading = false;
      return;
    }
    
    const index = parseInt(input) - 1;
    if (isNaN(index) || index < 0 || index >= this.userReservations.length) {
      this.addBotMessage(`Veuillez entrer un numéro entre 1 et ${this.userReservations.length}, ou dites "non" pour annuler.`);
      this.loading = false;
      return;
    }
    
    const reservation = this.userReservations[index];
    const formattedDate = this.chatbotService.formatDateFrench(reservation.date_reservation);
    
    this.addBotMessage(`📝 **Confirmation d'annulation**\n\nMenu : ${reservation.menu.plat_principal}\nDate : ${formattedDate}\nHeure : ${reservation.heure_recuperation?.substring(0, 5) || '12:30'}\n\n❌ Confirmez-vous l'annulation de cette réservation ? (oui/non)`);
    
    (this as any).reservationToCancel = reservation;
    this.session.step = 'confirming_cancellation';
    this.loading = false;
  }

  async confirmCancellation(input: string): Promise<void> {
    const reservation = (this as any).reservationToCancel;
    
    if (!reservation) {
      this.session.step = 'idle';
      this.addBotMessage("Erreur, veuillez réessayer.");
      this.loading = false;
      return;
    }
    
    if (input === 'oui' || input === 'yes' || input === 'o' || input === 'ok') {
      try {
        await this.reservationService.deleteReservationMenu(reservation.id_reservation!).toPromise();
        
        const formattedDate = this.chatbotService.formatDateFrench(reservation.date_reservation);
        
        this.addBotMessage(`✅ **RÉSERVATION ANNULÉE AVEC SUCCÈS !** 🗑️\n\n📋 Détails annulés :\n• Menu : ${reservation.menu.plat_principal}\n• Date : ${formattedDate}\n• Heure : ${reservation.heure_recuperation?.substring(0, 5) || '12:30'}\n\n**1 place a été libérée.**\n\n💡 Vous pouvez maintenant faire une nouvelle réservation !`);
        
        this.bookingCompleted.emit();
        
        this.session.step = 'idle';
        (this as any).reservationToCancel = null;
        
      } catch (error) {
        console.error('Erreur annulation:', error);
        this.addBotMessage("❌ Erreur lors de l'annulation. Veuillez réessayer.");
      }
    } 
    else if (input === 'non' || input === 'no' || input === 'n') {
      this.addBotMessage("❌ Annulation annulée. Votre réservation est conservée.");
      this.session.step = 'idle';
    }
    else {
      this.addBotMessage("Répondez par 'oui' ou 'non'");
      this.loading = false;
      return;
    }
    
    this.loading = false;
  }

  // ==================== RECHERCHE ET RÉSERVATION ====================

  private async searchDish(query: string): Promise<void> {
    const foundMenus = this.chatbotService.searchMenusByTerm(this.menus, query);
    
    if (foundMenus.length === 0) {
      const availableDishes = [...new Set(this.menus.map(m => m.plat_principal))];
      const suggestions = availableDishes.slice(0, 5).join(', ');
      this.addBotMessage(`😕 Je n'ai pas trouvé de menu contenant "${query}".\n\n📋 **Menus disponibles :**\n${suggestions}`);
      this.loading = false;
      return;
    }
    
    let response = `🔍 **${foundMenus.length} menu(s) trouvé(s) contenant "${query}" :**\n\n`;
    
    for (let i = 0; i < foundMenus.length; i++) {
      const menu = foundMenus[i];
      const realDate = this.chatbotService.getRealMenuDate(menu);
      const formattedDate = this.chatbotService.formatDateFrench(realDate);
      const availability = await this.chatbotService.checkAvailability(menu.id_menu!, realDate);
      
      let statusIcon = availability.alreadyReserved ? '✅' : (availability.available ? '🟢' : '🔴');
      let statusText = availability.alreadyReserved ? ' (déjà réservé)' : (availability.available ? ` (${availability.remaining} places)` : ' (complet)');
      
      response += `${i + 1}. ${statusIcon} **${menu.plat_principal}**${statusText}\n`;
      response += `   📅 ${menu.jour} - ${formattedDate}\n`;
      response += `   🥗 ${menu.entree} | 🍰 ${menu.dessert}\n\n`;
    }
    
    response += `💡 **Pour réserver**, répondez avec le **numéro** du menu (ex: "1") ou dites "non" pour annuler.`;
    
    this.addBotMessage(response);
    (this as any).foundMenus = foundMenus;
    this.session.step = 'selecting_menu';
    this.loading = false;
  }

  private async handleMenuSelection(input: string): Promise<void> {
    const foundMenus = (this as any).foundMenus;
    
    if (!foundMenus || foundMenus.length === 0) {
      this.session.step = 'idle';
      this.addBotMessage("Désolé, je n'ai pas trouvé les menus.");
      this.loading = false;
      return;
    }
    
    if (input === 'non' || input === 'annuler') {
      this.session.step = 'idle';
      this.addBotMessage("D'accord, réservation annulée.");
      this.loading = false;
      return;
    }
    
    const index = parseInt(input) - 1;
    if (isNaN(index) || index < 0 || index >= foundMenus.length) {
      this.addBotMessage(`Veuillez entrer un numéro entre 1 et ${foundMenus.length}, ou dites "non".`);
      this.loading = false;
      return;
    }
    
    const selectedMenu = foundMenus[index];
    this.session.selectedMenu = selectedMenu;
    
    const realMenuDate = this.chatbotService.getRealMenuDate(selectedMenu);
    const formattedRealDate = this.chatbotService.formatDateFrench(realMenuDate);
    const availability = await this.chatbotService.checkAvailability(selectedMenu.id_menu!, realMenuDate);
    
    if (availability.alreadyReserved) {
      this.addBotMessage(`✅ **Vous avez déjà réservé "${selectedMenu.plat_principal}" pour le ${formattedRealDate} !**\n\n📅 Voulez-vous réserver pour un autre jour ? (oui/non)`);
      this.session.step = 'selecting_alternative_date';
      this.loading = false;
      return;
    }
    
    if (!availability.available) {
      this.addBotMessage(`❌ Désolé, "${selectedMenu.plat_principal}" n'a plus de places pour le ${formattedRealDate}.\n\n📅 Voulez-vous un autre jour ? (oui/non)`);
      this.session.step = 'selecting_alternative_date';
      this.loading = false;
      return;
    }
    
    const details = this.chatbotService.formatMenuDetails(selectedMenu, formattedRealDate, availability);
    this.addBotMessage(`${details}\n\n✅ Voulez-vous réserver pour le ${formattedRealDate} (${selectedMenu.jour}) ?\n\n💡 Répondez "oui" ou donnez une autre date.`);
    
    this.session.step = 'selecting_date';
    this.session.selectedDate = realMenuDate;
    this.loading = false;
  }

  private async handleDateSelection(input: string): Promise<void> {
    const menu = this.session.selectedMenu;
    if (!menu) {
      this.session.step = 'idle';
      this.addBotMessage("Erreur.");
      this.loading = false;
      return;
    }
    
    const availableDates = this.chatbotService.getAvailableDatesForMenu(menu);
    const formattedDates = availableDates.map(d => this.chatbotService.formatDateFrench(d));
    
    if (input === 'oui' || input === 'yes' || input === 'o') {
      const date = this.session.selectedDate;
      if (date) {
        if (!availableDates.includes(date)) {
          this.addBotMessage(`❌ Date non disponible.\n\n📅 **Dates disponibles :**\n${formattedDates.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
          this.loading = false;
          return;
        }
        
        const availability = await this.chatbotService.checkAvailability(menu.id_menu!, date);
        if (availability.alreadyReserved) {
          this.addBotMessage(`✅ **Vous avez déjà réservé ce menu !**`);
          this.session.step = 'selecting_alternative_date';
          this.loading = false;
          return;
        }
        
        if (!availability.available) {
          this.addBotMessage(`❌ Plus de places. Autre date ?`);
          this.session.step = 'selecting_alternative_date';
          this.loading = false;
          return;
        }
        
        this.addBotMessage(`✅ ${availability.remaining} places.\n\n🕐 Heure ? (ex: "12:30")`);
        this.session.step = 'selecting_time';
        this.loading = false;
        return;
      }
    }
    
    let selectedDate = '';
    const dateIndex = parseInt(input) - 1;
    if (!isNaN(dateIndex) && dateIndex >= 0 && dateIndex < availableDates.length) {
      selectedDate = availableDates[dateIndex];
    } else {
      const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      const dayIndex = dayNames.indexOf(input.toLowerCase());
      if (dayIndex !== -1) {
        for (const date of availableDates) {
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
          if (dayName === input.toLowerCase()) {
            selectedDate = date;
            break;
          }
        }
      } else {
        const dateMatch = input.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
        if (dateMatch) {
          let year = dateMatch[3] || new Date().getFullYear();
          const parsedDate = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
          if (availableDates.includes(parsedDate)) {
            selectedDate = parsedDate;
          }
        }
      }
    }
    
    if (!selectedDate) {
      this.addBotMessage(`❌ Date non disponible.\n\n📅 **Dates disponibles :**\n${formattedDates.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
      this.loading = false;
      return;
    }
    
    const availability = await this.chatbotService.checkAvailability(menu.id_menu!, selectedDate);
    const formattedDate = this.chatbotService.formatDateFrench(selectedDate);
    
    if (availability.alreadyReserved) {
      this.addBotMessage(`✅ **Vous avez déjà réservé pour le ${formattedDate} !**`);
      this.session.step = 'selecting_alternative_date';
      this.loading = false;
      return;
    }
    
    if (!availability.available) {
      this.addBotMessage(`❌ Plus de places pour le ${formattedDate}.`);
      this.loading = false;
      return;
    }
    
    this.session.selectedDate = selectedDate;
    this.addBotMessage(`✅ ${availability.remaining} places pour le ${formattedDate}.\n\n🕐 Heure ? (ex: "12:30")`);
    this.session.step = 'selecting_time';
    this.loading = false;
  }

  private async handleAlternativeDateSelection(input: string): Promise<void> {
    const menu = this.session.selectedMenu;
    if (!menu) {
      this.session.step = 'idle';
      this.addBotMessage("Erreur.");
      this.loading = false;
      return;
    }
    
    if (input === 'non' || input === 'annuler') {
      this.session.step = 'idle';
      this.addBotMessage("Réservation annulée.");
      this.loading = false;
      return;
    }
    
    const availableDates = this.chatbotService.getAvailableDatesForMenu(menu);
    const formattedDates = availableDates.map(d => this.chatbotService.formatDateFrench(d));
    
    let selectedDate = '';
    const dateIndex = parseInt(input) - 1;
    if (!isNaN(dateIndex) && dateIndex >= 0 && dateIndex < availableDates.length) {
      selectedDate = availableDates[dateIndex];
    } else {
      const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      const dayIndex = dayNames.indexOf(input.toLowerCase());
      if (dayIndex !== -1) {
        for (const date of availableDates) {
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
          if (dayName === input.toLowerCase()) {
            selectedDate = date;
            break;
          }
        }
      } else {
        const dateMatch = input.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
        if (dateMatch) {
          let year = dateMatch[3] || new Date().getFullYear();
          const parsedDate = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
          if (availableDates.includes(parsedDate)) {
            selectedDate = parsedDate;
          }
        }
      }
    }
    
    if (!selectedDate) {
      this.addBotMessage(`❌ Date non disponible.\n\n📅 **Dates disponibles :**\n${formattedDates.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
      this.loading = false;
      return;
    }
    
    const availability = await this.chatbotService.checkAvailability(menu.id_menu!, selectedDate);
    const formattedDate = this.chatbotService.formatDateFrench(selectedDate);
    
    if (availability.alreadyReserved) {
      this.addBotMessage(`✅ **Vous avez déjà réservé pour le ${formattedDate} !**`);
      this.loading = false;
      return;
    }
    
    if (!availability.available) {
      this.addBotMessage(`❌ Plus de places pour le ${formattedDate}.`);
      this.loading = false;
      return;
    }
    
    this.session.selectedDate = selectedDate;
    this.addBotMessage(`✅ ${availability.remaining} places pour le ${formattedDate}.\n\n🕐 Heure ? (ex: "12:30")`);
    this.session.step = 'selecting_time';
    this.loading = false;
  }

  private async handleTimeSelection(input: string): Promise<void> {
    const menu = this.session.selectedMenu;
    const date = this.session.selectedDate;
    
    if (!menu || !date) {
      this.session.step = 'idle';
      this.addBotMessage("Erreur.");
      this.loading = false;
      return;
    }
    
    let time = '';
    const timeMatch = input.match(/(\d{1,2})[h:](\d{2})/);
    if (timeMatch) {
      time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else if (input.match(/^\d{1,2}$/)) {
      time = `${input.padStart(2, '0')}:00`;
    } else {
      this.addBotMessage("Format d'heure non reconnu. Entrez '12:30' ou '13h00'");
      this.loading = false;
      return;
    }
    
    const availability = await this.chatbotService.checkAvailability(menu.id_menu!, date);
    
    if (availability.alreadyReserved) {
      this.addBotMessage(`✅ **Vous avez déjà réservé ce menu !**`);
      this.session.step = 'selecting_alternative_date';
      this.loading = false;
      return;
    }
    
    if (!availability.available) {
      this.addBotMessage(`❌ Plus de places. Réservation annulée.`);
      this.session.step = 'idle';
      this.loading = false;
      return;
    }
    
    this.session.selectedTime = time;
    const formattedDate = this.chatbotService.formatDateFrench(date);
    const details = this.chatbotService.formatMenuDetails(menu, formattedDate, availability);
    
    this.addBotMessage(`📝 **RÉCAPITULATIF**\n\n${details}\n🕐 Heure : ${time}\n\n✅ Confirmez ? (oui/non)`);
    this.session.step = 'confirming';
    this.loading = false;
  }

  private async handleConfirmation(input: string): Promise<void> {
    const menu = this.session.selectedMenu;
    const date = this.session.selectedDate;
    const time = this.session.selectedTime;
    
    if (!menu || !date || !time) {
      this.session.step = 'idle';
      this.addBotMessage("Erreur.");
      this.loading = false;
      return;
    }
    
    if (input === 'oui' || input === 'yes' || input === 'o' || input === 'ok') {
      try {
        const availability = await this.chatbotService.checkAvailability(menu.id_menu!, date);
        
        if (availability.alreadyReserved) {
          this.addBotMessage(`✅ **Vous avez déjà réservé ce menu !**`);
          this.session.step = 'idle';
          this.loading = false;
          return;
        }
        
        if (!availability.available) {
          this.addBotMessage(`❌ Plus de places. Réservation annulée.`);
          this.session.step = 'idle';
          this.loading = false;
          return;
        }
        
        const reservation = await this.chatbotService.createReservation(menu.id_menu!, date, time);
        const formattedDate = this.chatbotService.formatDateFrench(date);
        
        this.addBotMessage(`✅ **RÉSERVATION CONFIRMÉE !** 🎉\n\n📋 Détails :\n• Menu : ${menu.plat_principal}\n• Date : ${formattedDate}\n• Heure : ${time}\n\n**${availability.remaining - 1} places restantes.**\n\nBon appétit ! 🙏`);
        
        this.bookingCompleted.emit();
        
        this.session = {
          step: 'idle',
          selectedMenu: null,
          selectedDate: null,
          selectedTime: null
        };
        
      } catch (error) {
        console.error('Erreur création réservation:', error);
        this.addBotMessage("❌ Erreur lors de la réservation.");
      }
    } else if (input === 'non' || input === 'no' || input === 'n') {
      this.addBotMessage("❌ Réservation annulée.");
      this.session.step = 'idle';
      this.session.selectedMenu = null;
      this.session.selectedDate = null;
      this.session.selectedTime = null;
    } else {
      this.addBotMessage("Répondez par 'oui' ou 'non'");
      this.loading = false;
      return;
    }
    
    this.loading = false;
  }

  private showAllMenus(): void {
    if (this.menus.length === 0) {
      this.addBotMessage("📭 Aucun menu disponible.");
      return;
    }
    
    let response = "📋 **MENUS DE LA SEMAINE**\n\n";
    for (let i = 0; i < this.menus.length; i++) {
      const menu = this.menus[i];
      const realDate = this.chatbotService.getRealMenuDate(menu);
      const formattedDate = this.chatbotService.formatDateFrench(realDate);
      response += `${i + 1}. **${menu.plat_principal}** (${menu.jour} - ${formattedDate})\n`;
      response += `   🥗 ${menu.entree} | 🍰 ${menu.dessert}\n`;
      response += `   👥 ${menu.nombre_disponible} places\n\n`;
    }
    this.addBotMessage(response);
  }

  private showHelp(): void {
    this.addBotMessage(`💡 **COMMANDES DISPONIBLES** 💡

🔍 **RECHERCHE DE PLATS**
• "bouza" / "assida" / "makrouna"

📋 **MES RÉSERVATIONS**
• "mes réservations"
• "affiche mes réservations"

❌ **ANNULATION**
• "annuler ma réservation"
• "annuler reservation"

📝 **NOUVELLE RÉSERVATION**
1. Dites le nom du plat (ex: "bouza")
2. Choisissez le menu (numéro)
3. Choisissez la date (numéro)
4. Choisissez l'heure
5. Confirmez

❓ **AIDE**
• "aide" ou "que peux-tu faire"`);
  }

  addUserMessage(text: string): void {
    this.messages.push({
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    });
  }

  addBotMessage(text: string, menu?: Menu): void {
    this.messages.push({
      id: Date.now().toString(),
      text: text,
      sender: 'bot',
      timestamp: new Date(),
      type: menu ? 'menu-card' : 'text',
      menu: menu
    });
  }
}