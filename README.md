# Ticketmister

* Users can list a ticket for an event (concert, sports) for sale
* Other users can purchase this ticket
* Any user can list tickets for sale and purchase tickets
* When a user attempts to purchase a ticket, the ticket is 'locked' for 15 minutes. The user has 15 minutes to enter their payment info.
* While locked, no other user can purchase the ticket. After 15 minutes, the ticket should 'unlock'
* Ticket prices can be edited if they are not locked

  <img width="526" alt="yt" src="https://github.com/Rajjyoti/Ticketmister/assets/44893239/790ccb13-f147-43a1-8473-7e43ed771076">


*Something to look into:
  When we send an event for ticket creation after saving it, we need to make sure the event is published to ensure data integrity. To do this, we can try creating an event db that keeps track if   an event is published or not. If not, there will be a service that will publish it.  
