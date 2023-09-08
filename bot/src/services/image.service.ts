import { Injectable } from '@nestjs/common';

import { Web3Service } from './web3.service';

import { AuctionData } from 'src/interfaces/gql.interface';

import { readFile, writeFile } from 'fs/promises';
import { createCanvas, Image, registerFont } from 'canvas';
import { stringify } from 'svgson';

import tinyColor from 'tinycolor2';
import path from 'path';

@Injectable()
export class ImageService {

  constructor(
    private readonly web3Svc: Web3Service
  ) {}

  async createImage(phunkId: string): Promise<{ base64: string, color: string }> {

    registerFont(path.join(__dirname, '../static/retro-computer.ttf'), { family: 'RetroComputer' });

    const canvasWidth = 1200;
    const canvasHeight = 1200;

    const phunkWidth = canvasWidth / 2;
    const phunkHeight = canvasHeight / 2;

    const bleed = 30 * 2;

    const lowerThird = ((canvasHeight / 3) * 2) - (bleed * 2) + 20;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#131415';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // const punkData = await this.web3Svc.punkDataContract['punkImage'](parseInt(phunkId).toString());
    const punkData = await this.web3Svc.getPunkImage(phunkId);
    const svg = await this.createPhunkSvg(punkData, phunkWidth, phunkHeight);
    const color = this.getColor(punkData);

    ctx.fillStyle = color;
    ctx.fillRect(bleed, bleed, canvasWidth - (bleed * 2), lowerThird);

    const img = new Image();
    img.onload = () => ctx.drawImage(
      img,
      (canvasWidth / 2) - (phunkWidth / 2) - (bleed / 2),
      lowerThird - phunkHeight + bleed
    );
    img.onerror = err => { throw err };
    img.src = Buffer.from(svg);

    // Line 1 (left side)
    const line1 = 'CryptoPhunk';
    const line1Pos = lowerThird + (bleed * 2);
    ctx.textBaseline = 'top';
    ctx.font = 'normal 36px RetroComputer';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line1,
      bleed,
      line1Pos
    );

    // Line 2 (left side)
    ctx.textBaseline = 'top';
    ctx.font = 'normal 120px RetroComputer';
    ctx.fillStyle = '#FF04B4';
    ctx.fillText(
      phunkId,
      bleed - 5,
      line1Pos + 20
    );

    // Line 3 (right side)
    const punkTraits = await this.web3Svc.getPunkAttributes(parseInt(phunkId).toString());
    const phunkData = this.getTraits(punkTraits);
    const sex = phunkData.traits.filter((tr) => tr.label === phunkData.sex)[0];
    
    const line3Pos = lowerThird + (bleed * 2);
    const line3_1 = `${phunkData.sex} phunks`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line3_1,
      canvasWidth - bleed,
      line3Pos
    );

    const line3_1Width = (ctx.measureText(line3_1).width + 8);

    const line3_2 = `${sex.value}`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff04b4';
    ctx.fillText(
      line3_2,
      canvasWidth - bleed - line3_1Width,
      line3Pos
    );

    const line3_2Width = (ctx.measureText(line3_2).width + 8);

    const line3_3 = `One of`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line3_3,
      canvasWidth - bleed - line3_1Width - line3_2Width,
      line3Pos
    );

    const line4Pos = lowerThird + (bleed * 2) + 40;
    const line4_1 = `Trait${phunkData.traits?.length > 2 ? 's' : ''}`
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line4_1,
      canvasWidth - bleed,
      line4Pos
    );

    const line4_1Width = (ctx.measureText(line4_1).width + 8);

    const line4_2 = `${phunkData.traitCount}`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff04b4';
    ctx.fillText(
      line4_2,
      canvasWidth - bleed - line4_1Width,
      line4Pos
    );

    let traitsPos = line4Pos + 30;
    for (const trait of phunkData.traits) {

      if (trait.label !== phunkData.sex) {

        const lineTrait_1 = `${(trait.value * 100) / 10000}%`;
        ctx.font = 'normal 20px RetroComputer';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(
          lineTrait_1,
          canvasWidth - bleed,
          traitsPos
        );

        const lineTrait_1Width = (ctx.measureText(lineTrait_1).width + 8);

        const lineTrait_2 = `${trait.label}`;
        ctx.font = 'normal 20px RetroComputer';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FF04B4';
        ctx.fillText(
          lineTrait_2,
          canvasWidth - bleed - lineTrait_1Width,
          traitsPos
        );
      }

      traitsPos = traitsPos + 30;
    }

    const phreePhunky = await readFile(path.join(__dirname, '../static/phree-phunky.svg'), { encoding: 'utf8' });
    const phreePhunkyImg = new Image();
    phreePhunkyImg.onload = () => ctx.drawImage(
      phreePhunkyImg,
      bleed,
      canvasHeight - bleed - 20
    );
    phreePhunkyImg.onerror = err => { throw err };
    phreePhunkyImg.src = Buffer.from(phreePhunky);

    const buffer = canvas.toBuffer('image/png');

    return { base64: buffer.toString('base64'), color: tinyColor(color).toHex() };
  }

  async createCard(auction: AuctionData): Promise<any> {

    const phunkId = auction.phunk.id;

    registerFont(path.join(__dirname, '../static/retro-computer.ttf'), { family: 'RetroComputer' });

    const canvasWidth = 800 * 2;
    const canvasHeight = 418 * 2;
    const bleed = 30 * 2;

    const phunkWidth = canvasWidth / 1.5;
    const phunkHeight = canvasHeight / 1.5;

    const rightSide = (canvasWidth / 2) + bleed;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#131415';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // const punkData = await this.web3Svc.punkDataContract['punkImage'](parseInt(phunkId).toString());
    const punkData = await this.web3Svc.getPunkImage(phunkId);
    const svg = await this.createPhunkSvg(punkData, phunkWidth, phunkHeight);
    const color = this.getColor(punkData);

    ctx.fillStyle = color;
    ctx.fillRect(
      bleed,
      bleed,
      rightSide - (bleed * 2),
      canvasHeight - (bleed * 2)
    );
    
    // ctx.fillStyle = color;
    // ctx.fillRect(
    //   rightSide,
    //   bleed,
    //   rightSide - (bleed * 3),
    //   canvasHeight - (bleed * 2)
    // );

    const img = new Image();
    img.onload = () => ctx.drawImage(
      img,
      (rightSide / 2) - (phunkWidth / 2) - (bleed / 2),
      canvasHeight - phunkHeight - bleed
    );
    img.onerror = err => { throw err };
    img.src = Buffer.from(svg);

    // Line 1 (left side)
    const line1 = 'CryptoPhunk';
    ctx.textBaseline = 'top';
    ctx.font = 'normal 40px RetroComputer';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line1,
      rightSide,
      bleed - 10
    );

    // Line 2 (left side)
    ctx.font = 'normal 132px RetroComputer';
    ctx.fillStyle = '#FF04B4';
    ctx.fillText(
      phunkId,
      rightSide - 6,
      bleed + 10
    );

    const punkTraits = await this.web3Svc.getPunkAttributes(parseInt(phunkId).toString());
    const phunkData = this.getTraits(punkTraits);
    const sex = phunkData.traits.filter((tr) => tr.label === phunkData.sex)[0];

    // Line 2
    const line2Pos = (bleed * 4.5);
    const line2_1 = `One of`;
    ctx.font = 'normal 28px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line2_1,
      rightSide,
      line2Pos
    );

    const line2_1Width = (ctx.measureText(line2_1).width + 8);
    const line2_2 = `${sex.value}`;
    ctx.font = 'normal 28px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff04b4';
    ctx.fillText(
      line2_2,
      rightSide + line2_1Width,
      line2Pos
    );

    const line2_2Width = (ctx.measureText(line2_2).width + 8);
    const line2_3 = `${phunkData.sex} phunks`;
    ctx.font = 'normal 28px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line2_3,
      rightSide + line2_1Width + line2_2Width,
      line2Pos
    );

    // Line 3
    const line3Pos = line2Pos + 50;
    const line3_1 = `${phunkData.traitCount}`;
    ctx.font = 'normal 28px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff04b4';
    ctx.fillText(
      line3_1,
      rightSide,
      line3Pos
    );

    const line3_1Width = (ctx.measureText(line3_1).width + 8);
    const line3_2 = `Trait${phunkData.traits?.length > 2 ? 's' : ''}`
    ctx.font = 'normal 28px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      line3_2,
      rightSide + line3_1Width,
      line3Pos
    );

    // Draw a line under the text
    ctx.beginPath();
    ctx.moveTo(rightSide, line3Pos + bleed + 30);
    ctx.lineTo(canvasWidth - bleed, line3Pos + bleed + 30);
    ctx.strokeStyle = '#FFFFFF';
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Line 4
    const line4Pos = line3Pos + 140;
    const line4_1 = `Current Bid`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.5;
    ctx.fillText(
      line4_1,
      rightSide,
      line4Pos
    );

    const line4_2 = `Time Remaining`;
    ctx.font = 'normal 24px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.5;
    ctx.fillText(
      line4_2,
      canvasWidth - bleed,
      line4Pos
    );

    ctx.globalAlpha = 1;

    // Line 5
    const line5Pos = line4Pos + 30;
    const line5_1 = Number(this.web3Svc.weiToEth(BigInt(auction.amount))).toFixed(3);
    ctx.font = 'normal 56px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff04b4';
    ctx.fillText(
      line5_1,
      rightSide,
      line5Pos
    );

    const line5_1Width = (ctx.measureText(line5_1).width + 8);
    const line5_2 = `ETH`;
    ctx.font = 'normal 20px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      line5_2,
      rightSide + line5_1Width,
      line5Pos + 40
    );

    const timeRemaining = this.millisecondsToTimeFormat((Number(auction.endTime) * 1000) - Date.now());

    const line5_3 = timeRemaining;
    ctx.font = 'normal 56px RetroComputer';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      line5_3,
      canvasWidth - bleed,
      line5Pos
    );

    // Site link
    const website_link = 'phunks.auction';
    ctx.font = 'normal 16px RetroComputer';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.25;
    ctx.fillText(
      website_link,
      rightSide,
      canvasHeight - bleed - 20
    );
    ctx.globalAlpha = 1;

    const phreePhunky = await readFile(path.join(__dirname, '../static/phree-phunky.svg'), { encoding: 'utf8' });
    const phreePhunkyImg = new Image();
    phreePhunkyImg.onload = () => ctx.drawImage(
      phreePhunkyImg,
      rightSide,
      canvasHeight - (bleed * 2)
    );
    phreePhunkyImg.onerror = err => { throw err };
    phreePhunkyImg.src = Buffer.from(phreePhunky);

    const buffer = canvas.toBuffer('image/png');

    await writeFile(`./test-${phunkId}.png`, buffer);
    // await writeFile(`./cards/${auctionId}.png`, image.base64, 'base64');
    return { base64: buffer.toString('base64'), color: tinyColor(color).toHex() };
  }

  // Get the "brightest" color from the punk data
  getColor(punkData: string): string {
    const colorGroups: any = {};
    const phunkArr = punkData?.replace('0x', '').match(/.{1,8}/g) as string[];
  
    phunkArr.map((color: any) => {
      if (!colorGroups[color]) colorGroups[color] = 1;
      colorGroups[color]++;
    });
  
    const hslColors = Object.keys(colorGroups).map((key: any) => tinyColor(key).toHsl());
    const brightest = hslColors.sort((a: any, b: any) => {
      if (b.s !== a.s) return b.s - a.s;
      return b.l - a.l;
    })[0];
  
    return tinyColor(brightest).setAlpha(.15).toRgbString();
  }
  
  // Create SVG from punk data
  async createPhunkSvg(punkData: string, width: number, height: number): Promise<any> {
    
    const phunkArr = punkData?.replace('0x', '').match(/.{1,8}/g) as string[];

    const svg = {
      name: 'svg',
      type: 'element',
      value: '',
      attributes: {
        xmlns: 'http://www.w3.org/2000/svg',
        version: '1.2',
        viewBox: '0 0 24 24',
        width: width.toString(),
        height: height.toString()
      },
      children: phunkArr.map((res, i) => {
        return {
          name: 'rect',
          type: 'element',
          value: '',
          attributes: {
            x: `${-(i % 24) + 24}`,
            y: `${Math.floor(i / 24)}`,
            width: '1',
            height: '1',
            'shape-rendering': 'crispEdges',
            fill: `#${res}`
          },
          children: []
        }
      })
    };

    return stringify(svg);
  }

  // Get traits for specified phunk
  getTraits(punkTraits: string): any {

    const traits = transformAttributes(punkTraits);

    function transformAttributes(attributes: string) {
      return attributes.split(', ').map((res: any, i: number) => {
        if (!i) return res.match(/[a-zA-Z]+/g)[0];
        return res;
      });
    }

    const values = {'Female':3840,'Earring':2459,'Green Eye Shadow':271,'Blonde Bob':147,'Male':6039,'Smile':238,'Mohawk':441,'Wild Hair':447,'Pipe':317,'Nerd Glasses':572,'Goat':295,'Big Shades':535,'Purple Eye Shadow':262,'Half Shaved':147,'Do-rag':300,'Clown Eyes Blue':384,'Spots':124,'Wild White Hair':136,'Messy Hair':460,'Luxurious Beard':286,'Big Beard':146,'Clown Nose':212,'Police Cap':203,'Blue Eye Shadow':266,'Straight Hair Dark':148,'Black Lipstick':617,'Clown Eyes Green':382,'Purple Lipstick':655,'Blonde Short':129,'Straight Hair Blonde':144,'Pilot Helmet':54,'Hot Lipstick':696,'Regular Shades':527,'Stringy Hair':463,'Small Shades':378,'Frown':261,'Eye Mask':293,'Muttonchops':303,'Bandana':481,'Horned Rim Glasses':535,'Crazy Hair':414,'Classic Shades':502,'Handlebars':263,'Mohawk Dark':429,'Dark Hair':157,'Peak Spike':303,'Normal Beard Black':289,'Cap':351,'VR':332,'Frumpy Hair':442,'Cigarette':961,'Normal Beard':292,'Red Mohawk':147,'Shaved Head':300,'Chinstrap':282,'Mole':644,'Knitted Cap':419,'Fedora':186,'Shadow Beard':526,'Straight Hair':151,'Hoodie':259,'Eye Patch':461,'Headband':406,'Cowboy Hat':142,'Tassle Hat':178,'3D Glasses':286,'Mustache':288,'Vape':272,'Choker':48,'Pink With Hat':95,'Welding Goggles':86,'Vampire Hair':147,'Mohawk Thin':441,'Tiara':55,'Zombie':88,'Front Beard Dark':260,'Cap Forward':254,'Gold Chain':169,'Purple Hair':165,'Beanie':44,'Clown Hair Green':148,'Pigtails':94,'Silver Chain':156,'Front Beard':273,'Rosy Cheeks':128,'Orange Side':68,'Wild Blonde':144,'Buck Teeth':78,'Top Hat':115,'Medical Mask':175,'Ape':24,'Alien':9};

    return {
      sex: traits[0],
      traits: traits.map((trait) => ({ label: trait, value: values[trait] })),
      traitCount: traits.length - 1,
    };
  }

  millisecondsToTimeFormat(ms: number): string {
    if (ms < 0) ms = 0;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}