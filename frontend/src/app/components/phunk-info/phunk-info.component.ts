import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from 'src/app/services/data.service';
import { Web3Service } from 'src/app/services/web3.service';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-phunk-info',
  templateUrl: './phunk-info.component.html',
  styleUrls: ['./phunk-info.component.scss']
})

export class PhunkInfoComponent implements OnChanges {

  @Input() currentAuction: any;

  phunkAttributes: string[] = [];

  traits: any = {'Female':3840,'Earring':2459,'Green Eye Shadow':271,'Blonde Bob':147,'Male':6039,'Smile':238,'Mohawk':441,'Wild Hair':447,'Pipe':317,'Nerd Glasses':572,'Goat':295,'Big Shades':535,'Purple Eye Shadow':262,'Half Shaved':147,'Do-rag':300,'Clown Eyes Blue':384,'Spots':124,'Wild White Hair':136,'Messy Hair':460,'Luxurious Beard':286,'Big Beard':146,'Clown Nose':212,'Police Cap':203,'Blue Eye Shadow':266,'Straight Hair Dark':148,'Black Lipstick':617,'Clown Eyes Green':382,'Purple Lipstick':655,'Blonde Short':129,'Straight Hair Blonde':144,'Pilot Helmet':54,'Hot Lipstick':696,'Regular Shades':527,'Stringy Hair':463,'Small Shades':378,'Frown':261,'Eye Mask':293,'Muttonchops':303,'Bandana':481,'Horned Rim Glasses':535,'Crazy Hair':414,'Classic Shades':502,'Handlebars':263,'Mohawk Dark':429,'Dark Hair':157,'Peak Spike':303,'Normal Beard Black':289,'Cap':351,'VR':332,'Frumpy Hair':442,'Cigarette':961,'Normal Beard':292,'Red Mohawk':147,'Shaved Head':300,'Chinstrap':282,'Mole':644,'Knitted Cap':419,'Fedora':186,'Shadow Beard':526,'Straight Hair':151,'Hoodie':259,'Eye Patch':461,'Headband':406,'Cowboy Hat':142,'Tassle Hat':178,'3D Glasses':286,'Mustache':288,'Vape':272,'Choker':48,'Pink With Hat':95,'Welding Goggles':86,'Vampire Hair':147,'Mohawk Thin':441,'Tiara':55,'Zombie':88,'Front Beard Dark':260,'Cap Forward':254,'Gold Chain':169,'Purple Hair':165,'Beanie':44,'Clown Hair Green':148,'Pigtails':94,'Silver Chain':156,'Front Beard':273,'Rosy Cheeks':128,'Orange Side':68,'Wild Blonde':144,'Buck Teeth':78,'Top Hat':115,'Medical Mask':175,'Ape':24,'Alien':9};

  constructor(
    private dataSvc: DataService,
    private web3Svc: Web3Service,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const phunkId = changes?.currentAuction?.currentValue?.phunkId;
    this.getAttributes(phunkId);
  }

  async getAttributes(phunkId: string): Promise<void> {
    const rawAttributes = phunkId ? await this.web3Svc.getPunkAttributes(phunkId) : null;
    this.phunkAttributes = rawAttributes ? this.dataSvc.transformAttributes(rawAttributes) : [];
  }

  async prevAuction(): Promise<void> {
    const allData = await firstValueFrom(this.dataSvc.auctionData$);
    const activeIndex = await firstValueFrom(this.dataSvc.activeIndex$);

    // console.log(activeIndex + 1, allData?.length)
    if (activeIndex + 1 < allData?.length) {
      this.router.navigate(['/auction', allData[activeIndex + 1]?.id]);
    }
  }

  async nextAuction(): Promise<void> {
    const allData = await firstValueFrom(this.dataSvc.auctionData$);
    const activeIndex = await firstValueFrom(this.dataSvc.activeIndex$);

    if (activeIndex === 1) {
      this.router.navigate(['/']);
    } else if (activeIndex > 1) {
      this.router.navigate(['/auction', allData[activeIndex - 1]?.id]);
    }
  }

}
