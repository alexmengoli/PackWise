import { AfterViewInit, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [MatIconModule, MatTabsModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css',
})
export class BottomNavComponent implements AfterViewInit {
  // injections
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // state
  private mobileTopBarFadeDistance = 0;
  protected readonly mobileTopBarOpacity = signal(1);

  public ngAfterViewInit(): void {
    this.updateMobileTopBarFadeDistance();
    this.updateMobileTopBarOpacity();
  }

  @HostListener('window:resize')
  protected updateMobileTopBarFadeDistance(): void {
    this.mobileTopBarFadeDistance = this.mobileTopBarHeight();
  }

  @HostListener('window:scroll')
  protected updateMobileTopBarOpacity(): void {
    const opacity: number =
      this.mobileTopBarFadeDistance === 0 ? 0 : 1 - window.scrollY / this.mobileTopBarFadeDistance;

    this.mobileTopBarOpacity.set(Math.max(0, Math.min(1, opacity)));
  }

  private mobileTopBarHeight(): number {
    const value: string = getComputedStyle(this.elementRef.nativeElement)
      .getPropertyValue('--app-mobile-top-bar-height')
      .trim();

    return cssLengthToPixels(value);
  }
}

function cssLengthToPixels(value: string): number {
  const numericValue: number = Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  if (value.endsWith('rem')) {
    const rootFontSize: number = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

    return numericValue * rootFontSize;
  }

  return numericValue;
}
