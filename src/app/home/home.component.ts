import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@core/services/socket.service';
import { v4 as uuidv4 } from 'uuid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { RoomUser } from '@core/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzInputModule, NzIconModule, NzButtonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  id = input.required<string>();

  readonly #router = inject(Router);
  readonly #socket = inject(SocketService);

  username = signal('');
  currentUser = signal<RoomUser | undefined>(undefined);

  #room = signal<RoomUser[]>([]);

  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  constructor() {
    effect(() => console.log(this.#room()));
  }

  ngOnInit(): void {
    if (this.id()) return;

    this.#router.navigate([`/${uuidv4()}`]);
  }

  onJoinRoom() {
    this.#socket.connect(this.id(), this.username());
    this.#setSubscriptions();
  }

  #setSubscriptions() {
    this.#socket
      .roomUpdates$()
      .pipe(map((result) => result.room))
      .subscribe((result) => {
        this.#room.set(result);

        if (this.currentUser()) return;
        const user = result.find((users) => users.name === this.username());
        this.currentUser.set(user);
      });

    this.#socket.broadcast$().subscribe((data) => console.log(data));
  }
}
